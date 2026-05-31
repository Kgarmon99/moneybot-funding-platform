import { db } from './db.js';

export function seedData(): void {
  const oppCount = db.prepare('SELECT COUNT(*) as count FROM opportunities').get() as { count: number };
  if (oppCount.count === 0) {
    const insert = db.prepare(`INSERT INTO opportunities (source_name, amount, deadline, stage, last_action, next_action, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insert.run('Y Combinator', 500000, '2025-03-10', 'Applied', 'Submitted application', 'Prepare for interview if selected', 'Winter 2025 batch');
    insert.run('LearnLaunch Accelerator', 150000, '2025-02-15', 'Interview', 'Phone screen completed', 'Pitch to investment committee', 'EdTech focused, strong fit');
    insert.run('South Park Commons', 250000, '2025-04-01', 'Qualified', 'Initial coffee chat', 'Send follow-up with deck', 'Community-driven, good network');
  }

  const grantCount = db.prepare('SELECT COUNT(*) as count FROM grants_accelerators').get() as { count: number };
  if (grantCount.count === 0) {
    const insert = db.prepare(`INSERT INTO grants_accelerators (name, organization, check_size_min, check_size_max, stage, sector, location, deadline, description, apply_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const grants = [
      ['NSF SBIR Phase I', 'National Science Foundation', 275000, 275000, 'Pre-seed', 'EdTech', 'US', '2025-03-15', 'Research-based edtech startups', 'https://www.nsf.gov/funding'],
      ['IES SBIR', 'Institute of Education Sciences', 200000, 200000, 'Pre-seed', 'EdTech', 'US', '2025-04-01', 'Education technology development', 'https://ies.ed.gov/funding'],
      ['Gates Foundation Grand Challenges', 'Bill & Melinda Gates Foundation', 100000, 1000000, 'Pre-seed', 'EdTech', 'Global', '2025-05-01', 'Innovative education solutions', 'https://gcgh.grandchallenges.org'],
      ['Chan Zuckerberg Initiative', 'Chan Zuckerberg Initiative', 50000, 500000, 'Pre-seed', 'EdTech', 'US', '2025-06-01', 'Education equity and access', 'https://chanzuckerberg.com'],
      ['Google for Startups Accelerator', 'Google', 0, 0, 'Pre-seed', 'EdTech', 'Global', '2025-03-01', 'Equity-free accelerator program', 'https://startup.google.com'],
      ['AWS EdStart', 'Amazon Web Services', 10000, 100000, 'Pre-seed', 'EdTech', 'Global', '2025-02-28', 'AWS credits + technical support', 'https://aws.amazon.com/edstart'],
      ['AT&T Aspire Accelerator', 'AT&T', 100000, 100000, 'Pre-seed', 'EdTech', 'US', '2025-04-15', 'Social impact edtech startups', 'https://www.att.com/aspire'],
      ['Imagine K12', 'Y Combinator', 150000, 150000, 'Pre-seed', 'EdTech', 'US', '2025-03-10', 'YC edtech track', 'https://www.ycombinator.com'],
      ['EdSurge Immersion', 'EdSurge', 0, 0, 'Pre-seed', 'EdTech', 'US', '2025-05-15', 'Network and mentorship program', 'https://www.edsurge.com'],
      ['Reach Capital', 'Reach Capital', 500000, 2000000, 'Seed', 'EdTech', 'US', '2025-06-30', 'Leading edtech VC fund', 'https://www.reachcapital.com'],
    ];
    for (const g of grants) {
      insert.run(...g);
    }
  }

  const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get() as { count: number };
  if (contactCount.count === 0) {
    const insert = db.prepare(`INSERT INTO contacts (name, company, role, relationship_strength, email, notes)
      VALUES (?, ?, ?, ?, ?, ?)`);
    insert.run('Sarah Chen', 'Reach Capital', 'Partner', 4, 'sarah@reachcapital.com', 'Met at ASU+GSV 2024');
    insert.run('Marcus Johnson', 'Y Combinator', 'Group Partner', 3, 'marcus@ycombinator.com', 'Former founder, edtech background');
    insert.run('Aisha Patel', 'GSV Ventures', 'Principal', 2, 'aisha@gsv.ventures', 'Warm intro via David');
    insert.run('David Kim', 'LearnLaunch', 'Managing Director', 5, 'david@learnlaunch.com', 'Long-time mentor and advisor');
    insert.run('Elena Rodriguez', 'Owl Ventures', 'Partner', 2, 'elena@owlvc.com', 'Introduced by Sarah Chen');
  }

  const connCount = db.prepare('SELECT COUNT(*) as count FROM connections').get() as { count: number };
  if (connCount.count === 0) {
    const insert = db.prepare(`INSERT INTO connections (from_contact_id, to_contact_id, intro_path, status, notes)
      VALUES (?, ?, ?, ?, ?)`);
    insert.run(1, 5, 'Sarah can intro to Elena', 'Pending', 'Ask Sarah for intro to Owl');
    insert.run(4, 2, 'David knows Marcus from YC', 'Intro Made', 'Introduction completed, follow up scheduled');
  }

  const docCount = db.prepare('SELECT COUNT(*) as count FROM documents').get() as { count: number };
  if (docCount.count === 0) {
    const insert = db.prepare(`INSERT INTO documents (name, folder, file_path, file_size, shareable_link, password)
      VALUES (?, ?, ?, ?, ?, ?)`);
    insert.run('MoneyBot Pitch Deck v3.pdf', 'Pitch Materials', '/uploads/pitch-deck-v3.pdf', 2500000, 'share-abc123', 'demo123');
    insert.run('Financial Model 2025.xlsx', 'Financials', '/uploads/financial-model-2025.xlsx', 1800000, 'share-def456', 'demo123');
  }

  const profileCount = db.prepare('SELECT COUNT(*) as count FROM startup_profile').get() as { count: number };
  if (profileCount.count === 0) {
    db.prepare(`INSERT INTO startup_profile (name, stage, sector, location, founded_year, team_size, revenue, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run('MoneyBot', 'Pre-seed', 'EdTech', 'US', 2024, 4, 0, 'AI-powered financial literacy platform for K-12 students');
  }
}
