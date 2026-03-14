export interface Reservation {
  id: string;
  courtId: number;
  startTime: string;
  endTime: string;
  playerName: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  date: string;
}

export const reservationApi = {
  async getReservations(date: string): Promise<Reservation[]> {
    try {
      const response = await fetch(`/api/reservations?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch reservations');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async createReservation(data: Omit<Reservation, 'id' | 'status'>): Promise<Reservation | null> {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create reservation');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  }
};
