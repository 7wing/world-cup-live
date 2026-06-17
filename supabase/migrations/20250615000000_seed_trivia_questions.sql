-- Seed initial FIFA World Cup trivia questions so the AI Trivia tab
-- is immediately playable even before the generate-trivia edge function
-- has produced questions or before a Gemini API key is configured.
-- All questions have match_id = NULL so they appear in the global pool.

INSERT INTO trivia_questions (id, question, options, answer, points, difficulty, tag, source, match_id)
VALUES
  (gen_random_uuid(), 'Which country has won the most FIFA World Cup titles?', to_jsonb(array['Brazil', 'Germany', 'Italy', 'Argentina']), 0, 20, 'easy', 'History', 'manual', NULL),
  (gen_random_uuid(), 'The 2026 FIFA World Cup will feature how many teams for the first time?', to_jsonb(array['32', '40', '48', '64']), 2, 20, 'easy', '2026', 'manual', NULL),
  (gen_random_uuid(), 'Which three countries are co-hosting the 2026 FIFA World Cup?', to_jsonb(array['USA, Canada, Mexico', 'USA, Canada, Brazil', 'Germany, France, Spain', 'Qatar, Saudi Arabia, UAE']), 0, 30, 'medium', '2026', 'manual', NULL),
  (gen_random_uuid(), 'Where will the 2026 FIFA World Cup Final be played?', to_jsonb(array['Los Angeles', 'New York New Jersey Stadium', 'Mexico City', 'Toronto']), 1, 30, 'medium', '2026', 'manual', NULL),
  (gen_random_uuid(), 'When does the 2026 FIFA World Cup opening match take place?', to_jsonb(array['June 11, 2026', 'July 19, 2026', 'August 1, 2026', 'May 20, 2026']), 0, 30, 'medium', '2026', 'manual', NULL),
  (gen_random_uuid(), 'Who won the 2022 FIFA World Cup in Qatar?', to_jsonb(array['France', 'Argentina', 'Brazil', 'Germany']), 1, 20, 'easy', '2022', 'manual', NULL),
  (gen_random_uuid(), 'Who is the all-time top scorer in FIFA World Cup history with 16 goals?', to_jsonb(array['Pelé', 'Ronaldo Nazário', 'Miroslav Klose', 'Lionel Messi']), 2, 30, 'medium', 'Records', 'manual', NULL),
  (gen_random_uuid(), 'Who holds the record for most goals in a single World Cup tournament (13)?', to_jsonb(array['Just Fontaine', 'Ronaldo Nazário', 'Gerd Müller', 'Miroslav Klose']), 0, 50, 'hard', 'Records', 'manual', NULL),
  (gen_random_uuid(), 'Which nation won the first-ever FIFA World Cup in 1930?', to_jsonb(array['Brazil', 'Argentina', 'Uruguay', 'Italy']), 2, 30, 'medium', 'History', 'manual', NULL),
  (gen_random_uuid(), 'How many countries have ever won the FIFA World Cup?', to_jsonb(array['6', '8', '10', '12']), 1, 30, 'medium', 'History', 'manual', NULL),
  (gen_random_uuid(), 'Which nation won the 2018 FIFA World Cup in Russia?', to_jsonb(array['Germany', 'Brazil', 'France', 'Croatia']), 2, 20, 'easy', 'History', 'manual', NULL),
  (gen_random_uuid(), 'Name one of the three official mascots for the 2026 World Cup.', to_jsonb(array['Zabivaka the Wolf', 'Maple the Moose', 'Fuleco the Armadillo', 'La’eeb']), 1, 20, 'easy', '2026', 'manual', NULL),
  (gen_random_uuid(), 'Which of these four nations will make their World Cup debut in 2026?', to_jsonb(array['Iceland', 'Curaçao', 'Panama', 'Russia']), 1, 30, 'medium', '2026', 'manual', NULL),
  (gen_random_uuid(), 'With roughly 156,000 people, which is the smallest nation ever to qualify for the World Cup?', to_jsonb(array['Iceland', 'Curaçao', 'Qatar', 'Wales']), 1, 50, 'hard', '2026', 'manual', NULL),
  (gen_random_uuid(), 'Which former 2006 World Cup winner became head coach of Uzbekistan before 2026?', to_jsonb(array['Fabio Cannavaro', 'Zinedine Zidane', ' Pep Guardiola', 'Marcello Lippi']), 0, 50, 'hard', '2026', 'manual', NULL),
  (gen_random_uuid(), 'The 2026 World Cup is the first to be co-hosted by how many nations?', to_jsonb(array['One', 'Two', 'Three', 'Four']), 2, 20, 'easy', '2026', 'manual', NULL),
  (gen_random_uuid(), 'How many matches will be played in the 2026 World Cup (the most ever)?', to_jsonb(array['64', '80', '104', '128']), 2, 30, 'medium', '2026', 'manual', NULL),
  (gen_random_uuid(), 'Which stadium will host the opening match of the 2026 World Cup?', to_jsonb(array['Azteca Stadium, Mexico City', 'SoFi Stadium, Los Angeles', 'MetLife Stadium, New Jersey', 'AT&T Stadium, Dallas']), 0, 30, 'medium', '2026', 'manual', NULL),
  (gen_random_uuid(), 'In the 2022 World Cup final, what was the score after extra time between Argentina and France?', to_jsonb(array['1–1', '2–2', '3–3', '4–4']), 2, 30, 'medium', '2022', 'manual', NULL),
  (gen_random_uuid(), 'Which player won the Golden Ball (best player) at the 2022 World Cup?', to_jsonb(array['Kylian Mbappé', 'Lionel Messi', 'Julián Álvarez', 'Antoine Griezmann']), 1, 20, 'easy', '2022', 'manual', NULL),
  (gen_random_uuid(), 'How many host cities will stage matches at the 2026 World Cup?', to_jsonb(array['10', '12', '16', '20']), 2, 30, 'medium', '2026', 'manual', NULL),
  (gen_random_uuid(), 'Which four nations are making their World Cup debut in 2026?', to_jsonb(array['Cape Verde, Curaçao, Jordan, Uzbekistan', 'Iceland, Wales, Qatar, Panama', 'Morocco, Senegal, Tunisia, Algeria', 'New Zealand, Australia, Japan, Korea']), 0, 30, 'medium', '2026', 'manual', NULL),
  (gen_random_uuid(), 'Who scored a hat-trick in the 2022 World Cup final?', to_jsonb(array['Lionel Messi', 'Kylian Mbappé', 'Ángel Di María', 'Olivier Giroud']), 1, 20, 'easy', '2022', 'manual', NULL),
  (gen_random_uuid(), 'The 2022 World Cup in Qatar was the first held in which region?', to_jsonb(array['North America', 'Middle East', 'Asia', 'Africa']), 1, 20, 'easy', 'History', 'manual', NULL),
  (gen_random_uuid(), 'Which country won back-to-back World Cups in 1958 and 1962?', to_jsonb(array['Germany', 'Brazil', 'Italy', 'Argentina']), 1, 50, 'hard', 'History', 'manual', NULL),
  (gen_random_uuid(), 'What is the mascot representing Canada at the 2026 World Cup?', to_jsonb(array['Clutch the Bald Eagle', 'Maple the Moose', 'Zayu the Jaguar', 'A polar bear']), 1, 20, 'easy', '2026', 'manual', NULL);
