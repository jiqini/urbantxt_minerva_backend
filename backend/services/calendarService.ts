import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  location?: string;
}

class CalendarService {
  private calendarId: string | null = null;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Web doesn't need calendar permissions
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Calendar permission error:', error);
      return false;
    }
  }

  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (Platform.OS === 'web') {
      return this.createWebCalendarEvent(event);
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Calendar permission denied');
      }

      if (!this.calendarId) {
        this.calendarId = await this.getOrCreateCalendar();
      }

      const eventId = await Calendar.createEventAsync(this.calendarId, {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        notes: event.notes,
        location: event.location,
        timeZone: 'America/El_Salvador',
      });

      return eventId;
    } catch (error) {
      console.error('Calendar event creation error:', error);
      return null;
    }
  }

  private createWebCalendarEvent(event: CalendarEvent): string {
    // Create ICS file content for web
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Minerva//Legal Assistant//ES',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.notes || ''}`,
      `LOCATION:${event.location || ''}`,
      `UID:${Date.now()}@minerva-legal.app`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    // Create download link
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(url);

    return 'web-calendar-event';
  }

  private async getOrCreateCalendar(): Promise<string> {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const minervaCalendar = calendars.find(cal => cal.title === 'Minerva Legal');

    if (minervaCalendar) {
      return minervaCalendar.id;
    }

    // Create new calendar
    const defaultCalendarSource = Platform.OS === 'ios' 
      ? await Calendar.getDefaultCalendarAsync()
      : { isLocalAccount: true, name: 'Minerva Legal' };

    const calendarId = await Calendar.createCalendarAsync({
      title: 'Minerva Legal',
      color: '#f59e0b',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: 'Minerva Legal',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });

    return calendarId;
  }
}

export const calendarService = new CalendarService();