import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0';
import { corsHeaders } from '../_shared/cors.ts';

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

    let semesterNum = 1;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        semesterNum = Number(body.semester) || 1;
      } catch (_) {
        // Fall back to query param
        const url = new URL(req.url);
        semesterNum = Number(url.searchParams.get('semester')) || 1;
      }
    } else {
      const url = new URL(req.url);
      semesterNum = Number(url.searchParams.get('semester')) || 1;
    }

    const { data, error } = await supabase
      .from('semesters')
      .select('semester, gpa, cgpa, subjects')
      .eq('user_id', user.id)
      .eq('semester', semesterNum)
      .maybeSingle();

    if (error) {
      throw error;
    }

    // Also fetch latest overall degree CGPA
    const { data: latestSem } = await supabase
      .from('semesters')
      .select('cgpa')
      .eq('user_id', user.id)
      .order('semester', { ascending: false })
      .limit(1)
      .maybeSingle();

    const overallCgpa = latestSem?.cgpa ?? data?.cgpa ?? null;

    if (!data) {
      return new Response(
        JSON.stringify({
          semester: semesterNum,
          gpa: null,
          cgpa: overallCgpa,
          subjects: [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        semester: data.semester,
        gpa: data.gpa,
        cgpa: overallCgpa,
        subjects: data.subjects || [],
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

