# Time Service Flow

Author: Ian Chien (Ian-I-Chien)  
Created: June 23, 2025

## Description
Time service for event automation and pet system.  
This module is part of our Discord bot.  
Supports cron jobs and one-time tasks (e.g. ranking, reminders).

## Proposed Design

```tree
src/
├── services/
│   └── timeService.js                # Core scheduling logic
│
├── jobs/
│   ├── loadAllJobs.js               # Auto-registers cron jobs (daily, weekly, monthly)
│   │
│   ├── daily/
│   │   └── rankingJob.js            # Daily task: update ranking
│   │
│   ├── weekly/
│   │   └── rankingJobs.js           # Weekly rank
│   │
│   ├── monthly/
│   │   └── rankingJobs.js           # Monthly rank
│   │
│   └── reminder/
│       ├── eventReminderJob.js      # One-time reminder before event
│       ├── eventStartJob.js         # One-time trigger at event start
│       └── recordingJob.js          # One-time voice recording trigger
```

```Flow
Time Service Flow
                            ┌────────────────────┐
                            │     index.js       |
                            └────────┬───────────┘
                                     │
                                     ▼
                   ┌──────────────────────────────────┐
                   │ loadAllJobs()                    │
                   │ - Scan jobs/daily/, weekly/, ... │
                   │ - registerCronJob()              │
                   └──────────────────────────────────┘
                                     │
                                     ▼
                   ┌──────────────────────────────────┐
                   │ TimeService.startAllCronJobs()   │
                   │ - Read all registered jobs       │
                   │ - Schedule with node-cron        │
                   └──────────────────────────────────┘
                                     │
                                     ▼
                             At scheduled time
                                     │
                                     ▼
                        ┌────────────────────────────┐
                        │    job.handler()           │
                        ├────────────────────────────┤
                        │  e.g. update ranking       │
                        └────────────────────────────┘


        ┌────────────┐
        │ Discord UI │───▶ User creates event with Discord UserID (<@DC_ID>)
        └────────────┘
               │     Manual action
               ▼
     ┌────────────────────────┐
     │    scheduleTask()      │ ◀─────────────┐
     ├────────────────────────┤               │
     │ - Save task to DB      │               │
     │ - Push to delay queue  │               │
     └────────────────────────┘               │
               │                              │
               ▼                              │
        Task enqueued                         ▼
               │                  ┌────────────────────────────┐
               │                  │   App Restart / Startup    │
               │                  └────────────────────────────┘
               │                              │
               │                              ▼
               │          ┌────────────────────────────────┐
               │          │ TimeService.initWorker()       │
               │          ├────────────────────────────────┤
               │          │ - Load tasks from DB           │
               │          │ - scheduleTask() → queue       │                  
               │          └────────────────────────────────┘
               │                              │
               ▼                              │
     ┌────────────────────────────┐           │
     │ Starts listening to queue  │  ◀────────┘    
     └────────────────────────────┘
               │
          delay expires
               │
               ▼
     ┌────────────────────────────┐
     │       Execute Job          │
     ├────────────────────────────┤
     │ e.g.                       │
     │ - eventReminderJob         │
     │ - eventStartJob            │
     │ - recordingJob             │
     └────────────────────────────┘
```