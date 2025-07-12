# Time Service Flow

Author: Ian Chien (Ian-I-Chien)  
Created: June 23, 2025

## Description
Time service for event automation and pet system.  
This module is part of our Discord bot.  
Supports cron jobs.

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
```