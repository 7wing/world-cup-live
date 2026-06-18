import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lrsphlbeqdqgsxwkmrlf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc3BobGJlcWRxZ3N4d2ttcmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDMxMDIsImV4cCI6MjA5NDU3OTEwMn0.XiSHi9k_uxnB8oNjWfUc_JOzKz2ywz98W7yfgbrpNu0'

const TEST_EMAIL = 'qa_agent@worldcuplive.test'
const TEST_PASSWORD = 'QA_Pass_2026!'

;(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // 1) Sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })
  if (authError) {
    console.error('Login failed:', authError.message)
    process.exit(1)
  }
  console.log('Signed in as', authData.user.email, 'id=', authData.user.id)

  // 2) Create event
  const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .insert({
      name: '🎉 Demo Virtual Watch Party',
      description: 'Created by the test account via direct API call!',
      type: 'virtual',
      link: 'https://zoom.us/j/123456789',
      match_id: null,
      created_by: authData.user.id,
      max_attendees: 50,
      starts_at: future.toISOString(),
    })
    .select()
    .single()

  if (eventError) {
    console.error('Create event failed:', eventError.message)
    console.error('Details:', eventError)
    process.exit(1)
  }
  console.log('Event created successfully!')
  console.log(JSON.stringify(eventData, null, 2))

  // 3) Fetch events list to confirm
  const { data: allEvents, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true })

  if (fetchError) {
    console.error('Fetch events failed:', fetchError.message)
    process.exit(1)
  }

  const ourEvent = allEvents.find(e => e.id === eventData.id)
  if (ourEvent) {
    console.log(`\nConfirmed: event "${ourEvent.name}" is in the events list (${allEvents.length} total events).`)
  } else {
    console.log('\nWarning: created event not found in fetch.')
  }
})()
