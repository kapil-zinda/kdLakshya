'use client';

import React, { useState } from 'react';

import { dummyCalendarEvents } from '@/data/studentDashboardDummyData';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const StudentCalendar: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toLocaleString('default', { month: 'long' }),
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );

  // Get all events
  const events = dummyCalendarEvents;

  // Filter events by selected month and year
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.toLocaleString('default', { month: 'long' }) ===
        selectedMonth && eventDate.getFullYear().toString() === selectedYear
    );
  });

  // Get all days in the selected month
  const daysInMonth = new Date(
    parseInt(selectedYear),
    new Date()
      .toLocaleString('default', { month: 'long' })
      .indexOf(selectedMonth) + 1,
    0,
  ).getDate();

  // Get the first day of the month
  const firstDayOfMonth = new Date(
    parseInt(selectedYear),
    new Date()
      .toLocaleString('default', { month: 'long' })
      .indexOf(selectedMonth),
    1,
  ).getDay();

  // Create calendar days array
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Function to get event for a specific day
  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.toLocaleString('default', { month: 'long' }) ===
          selectedMonth &&
        eventDate.getFullYear().toString() === selectedYear
      );
    });
  };

  // Function to get color based on event type
  const getEventColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-500';
      case 'holiday':
        return 'bg-green-500';
      case 'event':
        return 'bg-blue-500';
      case 'assignment':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Available months
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Available years
  const years = ['2022', '2023', '2024'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Academic Calendar</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
          {selectedMonth} {selectedYear}
        </h3>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-medium p-2">
              {day}
            </div>
          ))}

          {/* Empty cells for alignment */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="p-2"></div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={day}
                className={`p-2 rounded-lg ${
                  dayEvents.length > 0 ? 'bg-gray-700' : 'bg-gray-900'
                } min-h-[80px]`}
              >
                <div className="font-bold mb-1">{day}</div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded ${getEventColor(
                        event.type,
                      )} truncate`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event List */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
          Events in {selectedMonth} {selectedYear}
        </h3>

        {filteredEvents.length > 0 ? (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-gray-700 p-4 rounded-lg flex justify-between items-start"
              >
                <div>
                  <h4 className="font-medium text-lg">{event.title}</h4>
                  <p className="text-sm text-gray-300">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {event.startTime &&
                      ` • ${event.startTime} - ${event.endTime}`}
                  </p>
                  {event.description && (
                    <p className="mt-2 text-gray-400">{event.description}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs ${getEventColor(
                    event.type,
                  )}`}
                >
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No events found for this month.</p>
        )}
      </div>

      {/* Event Legend */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Event Types</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Exam</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Holiday</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>Event</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>Assignment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCalendar;
