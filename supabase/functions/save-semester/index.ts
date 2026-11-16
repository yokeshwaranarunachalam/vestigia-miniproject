import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0';
import { corsHeaders } from '../_shared/cors.ts';

const GRADE_POINTS: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'F': 0,
  'RA': 0,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { semester, subjects } = await req.json();
    const semNumber = Number(semester);

    if (!semNumber || semNumber < 1 || semNumber > 8) {
      return new Response(JSON.stringify({ error: 'Invalid semester (must be 1 to 8)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one subject is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Compute semester GPA
    let totalCredits = 0;
    let totalWeightedPoints = 0;

    const validatedSubjects = subjects.map((sub: any) => {
      const name = String(sub.name || '').trim();
      const credits = Number(sub.credits);
      const grade = String(sub.grade || '').toUpperCase();
      const point = GRADE_POINTS[grade] ?? 0;

      totalCredits += credits;
      totalWeightedPoints += credits * point;

      return {
        name,
        credits,
        grade,
        gradePoint: point,
      };
    });

    const gpa = totalCredits > 0 ? Math.round((totalWeightedPoints / totalCredits) * 100) / 100 : 0;

    // Upsert current semester record
    const { error: upsertError } = await supabase
      .from('semesters')
      .upsert(
        {
          user_id: user.id,
          semester: semNumber,
          gpa,
          cgpa: gpa, // temporarily set, will recompute cumulative cgpa below
          subjects: validatedSubjects,
        },
        { onConflict: 'user_id, semester' }
      );

    if (upsertError) {
      throw upsertError;
    }

    // Fetch all user semesters to compute true cumulative CGPA
    const { data: allSemesters, error: semFetchError } = await supabase
      .from('semesters')
      .select('semester, gpa, subjects')
      .eq('user_id', user.id);

    let cumulativeCgpa = gpa;
    if (!semFetchError && allSemesters && allSemesters.length > 0) {
      let degreeCredits = 0;
      let degreePoints = 0;

      for (const sem of allSemesters) {
        if (Array.isArray(sem.subjects)) {
          for (const s of sem.subjects) {
            const c = Number(s.credits) || 0;
            const p = GRADE_POINTS[s.grade] ?? 0;
            degreeCredits += c;
            degreePoints += c * p;
          }
        }
      }

      if (degreeCredits > 0) {
        cumulativeCgpa = Math.round((degreePoints / degreeCredits) * 100) / 100;
        // Update current semester's cgpa
        await supabase
          .from('semesters')
          .update({ cgpa: cumulativeCgpa })
          .eq('user_id', user.id)
          .eq('semester', semNumber);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        semester: semNumber,
        gpa,
        cgpa: cumulativeCgpa,
        subjects: validatedSubjects,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

