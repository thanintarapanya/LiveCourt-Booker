import { NextResponse } from 'next/server'

// Mock database for prototype
// In a production app, this would be a real database (PostgreSQL, MongoDB, etc.)
let reservations: any[] = [
  { id: '1', courtId: 1, startTime: '08:00', endTime: '09:00', playerName: 'John Doe', status: 'confirmed', date: new Date().toISOString().split('T')[0] },
  { id: '2', courtId: 2, startTime: '10:00', endTime: '11:00', playerName: 'Jane Smith', status: 'confirmed', date: new Date().toISOString().split('T')[0] },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (date) {
    const filtered = reservations.filter(r => r.date === date)
    return NextResponse.json(filtered)
  }

  return NextResponse.json(reservations)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Basic validation
    if (!body.courtId || !body.startTime || !body.endTime || !body.playerName || !body.date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newReservation = {
      id: Math.random().toString(36).substring(2, 9),
      ...body,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }

    reservations.push(newReservation)
    
    // Log for "sync" demonstration
    console.log(`[CourtFlow Sync] New reservation added: ${newReservation.id} for ${newReservation.playerName}`)

    return NextResponse.json(newReservation, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
