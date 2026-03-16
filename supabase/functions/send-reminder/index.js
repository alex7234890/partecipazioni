import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { guestIds } = await req.json()

    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      return new Response(JSON.stringify({ error: 'guestIds mancanti' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    const { data: guests, error } = await supabase
      .from('guests')
      .select('id, name, slug')
      .in('id', guestIds)

    if (error) throw error

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const WEDDING_URL = Deno.env.get('WEDDING_URL') || 'https://il-tuo-sito.vercel.app'
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@matteoeclio.it'

    const results = await Promise.allSettled(
      guests.map(async (guest) => {
        const inviteUrl = `${WEDDING_URL}/invite/${guest.slug}`

        const emailBody = {
          from: FROM_EMAIL,
          to: guest.email || 'noemail@example.com', // aggiungi campo email se necessario
          subject: `💌 Promemoria: conferma la tua presenza al matrimonio di Matteo & Clio`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FAF7F2; border-radius: 12px;">
              <h1 style="color: #C9A84C; font-size: 28px; text-align: center; margin-bottom: 8px;">
                Matteo &amp; Clio
              </h1>
              <p style="text-align: center; color: #888; margin-bottom: 32px;">ti ricordano del loro matrimonio</p>

              <p style="color: #333; line-height: 1.7;">
                Caro/a <strong>${guest.name}</strong>,
              </p>
              <p style="color: #333; line-height: 1.7;">
                Non abbiamo ancora ricevuto la tua conferma di presenza. Ti ricordiamo che puoi farlo
                cliccando sul bottone qui sotto.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteUrl}"
                   style="background: #C9A84C; color: white; padding: 14px 32px; border-radius: 50px;
                          text-decoration: none; font-size: 16px; display: inline-block;">
                  Visualizza il mio invito
                </a>
              </div>

              <p style="color: #888; font-size: 13px; text-align: center;">
                Con affetto,<br/>
                <em>Matteo &amp; Clio</em> 🌸
              </p>
            </div>
          `,
        }

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailBody),
        })

        if (!res.ok) {
          const err = await res.text()
          throw new Error(`Resend error per ${guest.name}: ${err}`)
        }

        return { id: guest.id, name: guest.name, status: 'sent' }
      })
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return new Response(
      JSON.stringify({ message: `Promemoria inviati: ${sent}, falliti: ${failed}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
