import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    console.log('Fonction déclenchée');
    const body = await req.json();
    console.log('Body reçu:', JSON.stringify(body));

    const { type, record, old_record } = body;

    // Vérification plus stricte des données reçues
    if (!record?.id || !record?.onboarding_step) {
      console.log('Données invalides:', { record });
      return new Response(
        JSON.stringify({ error: 'Données invalides' }), 
        { status: 400 }
      );
    }

    console.log('Vérification du type et du statut:', {
      type,
      newStep: record.onboarding_step,
      oldStep: old_record?.onboarding_step
    });

    // Vérifie si c'est bien une mise à jour vers COMPLETED
    if (
      type === 'UPDATE' &&
      record.onboarding_step === 'COMPLETED' &&
      old_record?.onboarding_step !== 'COMPLETED'
    ) {
      // Mise à jour de onboarding_completed_at
      const supabase = createClient(
        Deno.env.get('PROJECT_URL') ?? '',
        Deno.env.get('SERVICE_ROLE_KEY') ?? ''
      );

      // Met à jour la date de completion
      await supabase
        .from('user')
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq('id', record.id);

      // Appel webhook n8n
      const response = await fetch(
        'https://n8n-6pil.onrender.com/webhook/5e8d04c8-52eb-4802-91f9-66b4c03bba65',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: record.id,
            onboarding_step: record.onboarding_step,
            completed_at: new Date().toISOString()
          }),
        }
      );

      if (!response.ok) {
        console.error('Erreur n8n:', await response.text());
        return new Response(
          JSON.stringify({ error: 'Erreur lors de l\'appel n8n' }), 
          { status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, user_id: record.id }), 
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ ignored: true }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    );
  }
});
