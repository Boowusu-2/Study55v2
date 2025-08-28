import React, { useState } from "react";
import { Bell, Clock, CheckCircle } from "lucide-react";

interface StudyReminder {
  id: string;
  title: string;
  time: string;
  days: string[];
  isActive: boolean;
}

interface StudyRemindersProps {
  reminders: StudyReminder[];
  onAddReminder: (reminder: Omit<StudyReminder, "id">) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export default function StudyReminders({
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
}: StudyRemindersProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    time: "09:00",
    days: [] as string[],
  });

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleAddReminder = () => {
    if (newReminder.title && newReminder.days.length > 0) {
      onAddReminder({
        title: newReminder.title,
        time: newReminder.time,
        days: newReminder.days,
        isActive: true,
      });
      setNewReminder({ title: "", time: "09:00", days: [] });
      setShowAddForm(false);
    }
  };

  const toggleDay = (day: string) => {
    setNewReminder((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  return (
    <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Study Reminders</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Reminder"}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            New Reminder
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Reminder Title
              </label>
              <input
                type="text"
                value={newReminder.title}
                onChange={(e) =>
                  setNewReminder((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Study Math"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Time
              </label>
              <input
                type="time"
                value={newReminder.time}
                onChange={(e) =>
                  setNewReminder((prev) => ({ ...prev, time: e.target.value }))
                }
                className="px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Days
              </label>
              <div className="flex gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      newReminder.days.includes(day)
                        ? "bg-purple-500 text-white"
                        : "bg-white/20 text-white/60 hover:bg-white/30"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddReminder}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Add Reminder
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-purple-200">
            <Bell className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>No reminders set</p>
            <p className="text-sm">
              Add a reminder to stay consistent with your studies
            </p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                reminder.isActive
                  ? "bg-white/10 border-white/20"
                  : "bg-white/5 border-white/10 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleReminder(reminder.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    reminder.isActive
                      ? "bg-green-500 border-green-500"
                      : "border-white/40"
                  }`}
                >
                  {reminder.isActive && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </button>
                <div>
                  <h4 className="text-white font-medium">{reminder.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-purple-200">
                    <Clock className="w-3 h-3" />
                    <span>{reminder.time}</span>
                    <span>•</span>
                    <span>{reminder.days.join(", ")}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDeleteReminder(reminder.id)}
                className="text-white/40 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
