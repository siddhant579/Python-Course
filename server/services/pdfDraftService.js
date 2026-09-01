// Turns raw extracted PDF text into a best-effort DRAFT outline the admin can
// review/edit before anything is published. It never invents content - every
// line in the draft is copied verbatim from the PDF text; it only groups
// lines under detected headings.
//
// Heuristic: a line is treated as a "Week" heading if it starts with
// Week/Chapter/Module/Unit + a number. A line is a "Topic" heading if it is
// short (<80 chars), title-cased/numbered, and not already consumed as text.
// Everything else becomes lesson content text under the current topic.

const WEEK_HEADING = /^(week|chapter|module|unit)\s*\d+/i;
const TOPIC_HEADING = /^(\d+(\.\d+)*[\.\)]?\s+|topic\s*\d+[:\-]?\s*)/i;

function buildDraftStructure(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const weeks = [];
  let currentWeek = null;
  let currentTopic = null;

  const ensureWeek = (title) => {
    currentWeek = { title, topics: [] };
    weeks.push(currentWeek);
    currentTopic = null;
  };

  const ensureDefaultWeek = () => {
    if (!currentWeek) ensureWeek('Untitled Week 1');
  };

  for (const line of lines) {
    if (WEEK_HEADING.test(line)) {
      ensureWeek(line);
      continue;
    }

    if (TOPIC_HEADING.test(line) && line.length < 100) {
      ensureDefaultWeek();
      currentTopic = { title: line.replace(TOPIC_HEADING, '').trim() || line, contentLines: [] };
      currentWeek.topics.push(currentTopic);
      continue;
    }

    ensureDefaultWeek();
    if (!currentTopic) {
      currentTopic = { title: 'General', contentLines: [] };
      currentWeek.topics.push(currentTopic);
    }
    currentTopic.contentLines.push(line);
  }

  // Number weeks/topics for admin editing convenience
  weeks.forEach((w, wi) => {
    w.weekNumber = wi + 1;
    w.topics.forEach((t, ti) => {
      t.order = ti;
    });
  });

  return { weeks, generatedAt: new Date().toISOString() };
}

module.exports = { buildDraftStructure };
