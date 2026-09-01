// Creates ONE starter course with entirely original content (written fresh
// for this project - no text, examples, exercise wording or business details
// copied from any other site) so the platform has something real to click
// through immediately. Everything here is fully editable/deletable via the
// Admin UI afterward, and none of it is hardcoded into React; it all lives
// in MongoDB like any other admin-authored content.
//
// Idempotent: re-running this script deletes the previous demo course (and
// everything nested under it) and recreates it fresh, so it's safe to run
// again after editing this file.
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Week = require('../models/Week');
const Topic = require('../models/Topic');
const Lesson = require('../models/Lesson');
const Exercise = require('../models/Exercise');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

const DEMO_COURSE_TITLE = 'Python Programming';

async function wipeExistingDemoCourse() {
  const existing = await Course.findOne({ title: DEMO_COURSE_TITLE });
  if (!existing) return;

  const weeks = await Week.find({ courseId: existing._id }).select('_id');
  const weekIds = weeks.map((w) => w._id);
  const topics = await Topic.find({ weekId: { $in: weekIds } }).select('_id');
  const topicIds = topics.map((t) => t._id);
  const lessons = await Lesson.find({ topicId: { $in: topicIds } }).select('_id');
  const lessonIds = lessons.map((l) => l._id);
  const quizzes = await Quiz.find({ weekId: { $in: weekIds } }).select('_id');
  const quizIds = quizzes.map((q) => q._id);

  await Promise.all([
    Exercise.deleteMany({ lessonId: { $in: lessonIds } }),
    Question.deleteMany({ quizId: { $in: quizIds } }),
    Quiz.deleteMany({ weekId: { $in: weekIds } }),
    Lesson.deleteMany({ topicId: { $in: topicIds } }),
    Topic.deleteMany({ weekId: { $in: weekIds } }),
    Week.deleteMany({ courseId: existing._id }),
    existing.deleteOne(),
  ]);
  console.log('Removed previous demo course to recreate it fresh.');
}

// --- Content -----------------------------------------------------------
// topic.lessons is an array so a topic can hold several short lessons,
// matching how a real multi-lesson topic would be authored via Admin.

const TOPICS = [
  {
    title: 'Python Basics',
    description: 'Getting started: what Python is, your first program, comments and indentation.',
    lessons: [
      {
        title: 'Introduction to Python',
        description: 'What Python is, why it exists, and where it is used today.',
        estimatedMinutes: 8,
        content: [
          { type: 'text', text: 'Python is a programming language created by Guido van Rossum in 1991. It reads almost like plain English, which makes it a great first language.' },
          { type: 'note', text: 'It\'s named after the comedy show "Monty Python\'s Flying Circus" - not the snake.' },
          {
            type: 'code',
            language: 'python',
            caption: 'first_look.py',
            code: `print("Learning Python starts here.")`,
          },
          { type: 'text', text: 'Where it\'s used: websites, data analysis, AI, automation, and games.' },
          { type: 'text', text: 'Popular tools to write Python: VS Code, PyCharm, Jupyter Notebook, Google Colab.' },
        ],
      },
      {
        title: 'Your First Python Program',
        description: 'Running your first line of code with print().',
        estimatedMinutes: 6,
        content: [
          { type: 'text', text: 'print() is a built-in function that displays text on the screen. It is usually the very first thing anyone writes in a new language, because it gives instant, visible proof that your code ran.' },
          {
            type: 'code',
            language: 'python',
            caption: 'hello.py',
            code: `print("Hello there!")`,
          },
          { type: 'text', text: 'Text placed in quotes like this is called a string. You can print several pieces of text (or values) at once by separating them with commas - print() joins them with a space automatically.' },
          {
            type: 'code',
            language: 'python',
            caption: 'hello_multi.py',
            code: `print("Result:", 2 + 2)`,
          },
        ],
      },
      {
        title: 'Comments in Python',
        description: 'Leaving notes in your code that Python ignores when running it.',
        estimatedMinutes: 6,
        content: [
          { type: 'text', text: 'A comment is a line (or part of a line) that Python skips entirely when it runs your program. Comments start with a # symbol. They exist purely for humans reading the code - to explain intent, leave reminders, or temporarily switch off a line without deleting it.' },
          {
            type: 'code',
            language: 'python',
            caption: 'Without comments - works, but the reader has to guess what it computes.',
            code: `w = 12\nh = 7\nprint(w * h)`,
          },
          {
            type: 'code',
            language: 'python',
            caption: 'with_comments.py',
            code: `# Compute the area of a room in square meters\nwidth = 12   # meters\nheight = 7   # meters\nprint(width * height)  # prints 84`,
          },
        ],
      },
      {
        title: 'Python Indentation',
        description: 'Why whitespace at the start of a line actually matters in Python.',
        estimatedMinutes: 7,
        content: [
          { type: 'text', text: 'Most languages use curly braces { } to mark which lines belong inside a loop, function, or condition. Python instead uses indentation - the whitespace at the start of a line - to do the same job. A consistent 4 spaces per level is the standard convention.' },
          {
            type: 'code',
            language: 'python',
            caption: 'wrong_indent.py',
            code: `age = 20\nif age >= 18:\nprint("You can vote")   # missing indentation -> IndentationError`,
          },
          {
            type: 'code',
            language: 'python',
            caption: 'correct_indent.py',
            code: `age = 20\nif age >= 18:\n    print("You can vote")   # indented -> part of the if block\nprint("This line always runs")  # not indented -> outside the if block`,
          },
          { type: 'note', text: "Python 3 doesn't allow mixing tabs and spaces in the same block - pick one (spaces are the convention) and let your editor auto-indent for you." },
        ],
      },
    ],
    exercises: [
      {
        title: 'Print a Greeting',
        instructions: 'Write a single line of code that prints "I am learning Python!" to the screen.',
        starterCode: `# your code here`,
        hints: ['Use print() with the text inside quotes.'],
        expectedOutput: 'I am learning Python!',
        difficulty: 'easy',
      },
      {
        title: 'Fix the Indentation',
        instructions: 'This code should print "Access granted" only when unlocked is True, but it has a missing indentation. Fix it.',
        starterCode: `unlocked = True\nif unlocked:\nprint("Access granted")`,
        hints: ['The line inside the if block needs 4 spaces before it.'],
        expectedOutput: 'Access granted',
        difficulty: 'easy',
      },
    ],
    quiz: {
      questions: [
        { type: 'mcq', text: 'Which symbol starts a comment in Python?', options: ['//', '#', '<!--', '/*'], correctAnswer: '#', explanation: 'Python comments start with a # and run to the end of the line.' },
        { type: 'mcq', text: 'What does print() do?', options: ['Deletes a variable', 'Displays output on the screen', 'Defines a function', 'Starts a loop'], correctAnswer: 'Displays output on the screen', explanation: 'print() is a built-in function that displays text/values on the screen.' },
        { type: 'mcq', text: 'What does Python use to define a block of code (instead of curly braces)?', options: ['Semicolons', 'Indentation', 'Parentheses', 'Colons only'], correctAnswer: 'Indentation', explanation: 'Python groups statements by indentation level, not braces.' },
        { type: 'truefalse', text: 'Mixing tabs and spaces for indentation is allowed in Python 3.', options: [], correctAnswer: 'false', explanation: 'Python 3 disallows mixing tabs and spaces in the same block - it raises a TabError.' },
        { type: 'code', text: 'Print the text: Learning Python', starterCode: '# write your code here', hints: ['Use print() with the exact text in quotes.'], correctAnswer: 'Learning Python', explanation: 'print("Learning Python") displays that exact text.' },
        { type: 'code', text: 'Print the result of 6 + 4.', starterCode: '# your code here', hints: ['print(6 + 4)'], correctAnswer: '10', explanation: '6 + 4 evaluates to 10.' },
        { type: 'code', text: 'This code already works - add a comment above it explaining what it does, then run it.', starterCode: 'print(2 ** 3)', hints: ['Comments start with #.'], correctAnswer: '8', explanation: '2 ** 3 is 2 to the power of 3, which is 8.' },
        { type: 'code', text: 'Fix the indentation so this prints Done.', starterCode: 'if True:\nprint("Done")', hints: ['Indent the line inside the if block with 4 spaces.'], correctAnswer: 'Done', explanation: 'The line inside an if block must be indented.' },
        { type: 'code', text: 'Print the length of the word "Python" using len().', starterCode: 'word = "Python"\n# print its length', hints: ['len(word) counts the characters.'], correctAnswer: '6', explanation: '"Python" has 6 characters.' },
      ],
    },
  },
  {
    title: 'Data Types & Variables',
    description: 'Storing values with variables, and the core built-in data types.',
    lessons: [
      {
        title: 'Python Data Types',
        description: 'The four basic types you will use constantly: int, float, str, bool.',
        estimatedMinutes: 9,
        content: [
          { type: 'text', text: 'Every value in Python has a type, which determines what you can do with it. The four basics: int for whole numbers, float for decimal numbers, str for text, and bool for True/False.' },
          {
            type: 'code',
            language: 'python',
            caption: 'data_types.py',
            code: `quantity = 12          # int\nprice = 4.99           # float\nitem = "notebook"      # str\nin_stock = True         # bool\n\nprint(type(quantity))\nprint(type(price))\nprint(type(item))\nprint(type(in_stock))`,
          },
          { type: 'note', text: 'You can convert between types explicitly with int(), float(), and str() - e.g. int("42") turns the string "42" into the number 42.' },
        ],
      },
      {
        title: 'Variables in Python',
        description: 'Creating, changing and naming variables.',
        estimatedMinutes: 10,
        content: [
          { type: 'text', text: 'A variable is a name that refers to a value in memory. Python is dynamically typed - you never declare a type up front, it is inferred from whatever value you assign.' },
          {
            type: 'code',
            language: 'python',
            caption: 'variables.py',
            code: `city = "Pune"\nprint(city)\n\n# a variable can be reassigned to a different type entirely\ncity = 5\nprint(city)`,
          },
          { type: 'text', text: 'Python is case-sensitive, so score and Score are two different variables. Use del to remove a variable if you no longer need it; using it afterward raises a NameError.' },
          {
            type: 'code',
            language: 'python',
            caption: 'naming.py',
            code: `score = 100\nScore = 200\nprint(score, Score)   # 100 200 - two separate variables\n\ndel score\n# print(score)  # would raise: NameError: name 'score' is not defined`,
          },
          { type: 'note', text: 'Prefer descriptive names over short ones - total_price reads far better six months later than tp. Python convention is snake_case (lowercase with underscores), since variable names cannot contain spaces.' },
        ],
      },
      {
        title: 'Basic Operations',
        description: 'Arithmetic on numbers, and common operations on strings.',
        estimatedMinutes: 9,
        content: [
          { type: 'text', text: 'The standard arithmetic operators: + add, - subtract, * multiply, / divide, // floor division (drops the remainder), % modulus (the remainder itself), ** exponent.' },
          {
            type: 'code',
            language: 'python',
            caption: 'arithmetic.py',
            code: `a, b = 17, 5\nprint(a + b)    # 22\nprint(a - b)    # 12\nprint(a * b)    # 85\nprint(a / b)    # 3.4\nprint(a // b)   # 3\nprint(a % b)    # 2\nprint(a ** 2)   # 289`,
          },
          { type: 'text', text: 'Strings support some of the same operators with different meaning: + joins two strings together, and * repeats a string.' },
          {
            type: 'code',
            language: 'python',
            caption: 'strings.py',
            code: `first = "Py"\nsecond = "Learn"\nprint(first + second)     # PyLearn\nprint(first * 3)          # PyPyPy\nprint(len(first + second)) # 7`,
          },
        ],
      },
    ],
    exercises: [
      {
        title: 'Rectangle Area',
        instructions: 'Create two variables, length and width, then print their product (the area).',
        starterCode: `length = 8\nwidth = 3\n# print the area`,
        hints: ['area = length * width'],
        expectedOutput: '24',
        difficulty: 'easy',
      },
      {
        title: 'Rename These Variables',
        instructions: 'This code works but the variable names give no clue what it represents. Rewrite it with clear, descriptive names for a shopping total: price per item, quantity bought, and the total cost.',
        starterCode: `a = 25\nb = 3\nc = a * b\nprint(c)`,
        hints: ['Try price_per_item, quantity, total_cost.'],
        expectedOutput: '75',
        difficulty: 'easy',
      },
    ],
    quiz: {
      questions: [
        { type: 'mcq', text: 'What is the data type of the value 3.14?', options: ['int', 'float', 'str', 'bool'], correctAnswer: 'float', explanation: 'Any number with a decimal point is a float in Python.' },
        { type: 'mcq', text: 'What is the data type of the value 10 (no decimal point)?', options: ['int', 'float', 'str', 'bool'], correctAnswer: 'int', explanation: 'Whole numbers without a decimal point are the int type.' },
        { type: 'mcq', text: 'Which data type would you use to store True or False?', options: ['int', 'bool', 'str', 'float'], correctAnswer: 'bool', explanation: 'bool is Python\'s boolean type, holding True or False.' },
        { type: 'mcq', text: 'What does int(7.9) evaluate to?', options: ['7', '8', '7.9', 'Error'], correctAnswer: '7', explanation: 'int() truncates (cuts off) the decimal part rather than rounding, so int(7.9) is 7.' },
        { type: 'mcq', text: 'Which of these is a valid Python variable name?', options: ['2total', 'total-2', 'class', 'total_2'], correctAnswer: 'total_2', explanation: 'Variable names can\'t start with a digit, can\'t contain hyphens, and can\'t be a reserved keyword like class. total_2 is valid.' },
        { type: 'mcq', text: 'What does 17 // 5 evaluate to?', options: ['3.4', '3', '2', '4'], correctAnswer: '3', explanation: '// is floor division - it divides and drops the remainder, so 17 // 5 = 3.' },
        { type: 'mcq', text: 'What does 17 % 5 evaluate to?', options: ['3', '2', '3.4', '0'], correctAnswer: '2', explanation: '% is the modulus operator - it returns the remainder, so 17 % 5 = 2.' },
        { type: 'code', text: 'Convert the string "45" to an int and print it.', starterCode: 'value = "45"\n# convert and print', hints: ['Use int(value).'], correctAnswer: '45', explanation: 'int("45") converts the string to the integer 45.' },
        { type: 'code', text: 'Print the type of the number 10.', starterCode: 'print(type(10))', hints: ['Just run the code as-is.'], correctAnswer: "<class 'int'>", explanation: "type(10) reports it's an int." },
        { type: 'code', text: 'Create a variable age with the value 25, then print it.', starterCode: '# your code here', hints: ['age = 25, then print(age).'], correctAnswer: '25', explanation: 'Assign with = then print the variable.' },
        { type: 'code', text: 'Print the result of 29 // 4 (floor division).', starterCode: 'print(29 // 4)', hints: ['// drops the remainder.'], correctAnswer: '7', explanation: '29 // 4 is 7, with the remainder dropped.' },
        { type: 'code', text: 'Print the result of 3 + 0.5.', starterCode: 'print(3 + 0.5)', hints: ['Adding an int and a float gives a float.'], correctAnswer: '3.5', explanation: 'int + float = float, so the result is 3.5.' },
      ],
    },
  },
  {
    title: 'Conditionals',
    description: 'if / elif / else and comparison operators.',
    lessons: [
      {
        title: 'Making Decisions with if/elif/else',
        description: 'How to branch program flow based on a condition.',
        estimatedMinutes: 10,
        content: [
          { type: 'text', text: 'Conditionals let a program take different paths depending on whether an expression evaluates to True or False.' },
          {
            type: 'code',
            language: 'python',
            caption: 'conditionals.py',
            code: `temperature = 28\n\nif temperature > 30:\n    print("It's hot")\nelif temperature > 20:\n    print("It's warm")\nelse:\n    print("It's cold")`,
          },
          { type: 'note', text: 'Comparison operators: == equal, != not equal, >, <, >=, <=. Combine conditions with and / or / not.' },
        ],
      },
    ],
    exercises: [
      {
        title: 'Pass or Fail',
        instructions: 'Given a variable score (0-100), print "Pass" if score is 40 or above, otherwise print "Fail".',
        starterCode: `score = 55\n# your code here`,
        hints: ['A single if/else is enough here.'],
        expectedOutput: 'Pass',
        difficulty: 'easy',
      },
    ],
    quiz: {
      questions: [
        { type: 'mcq', text: 'Which keyword checks an additional condition after an if, before falling back to else?', options: ['elseif', 'elif', 'or', 'then'], correctAnswer: 'elif', explanation: 'Python uses elif (not "elseif") to chain additional conditions.' },
        { type: 'mcq', text: 'Which operator checks equality (not assignment)?', options: ['=', '==', '=>', '==='], correctAnswer: '==', explanation: 'A single = assigns a value; == compares two values for equality.' },
        { type: 'code', text: 'Given num = 7, print "Odd" if it\'s odd, otherwise "Even".', starterCode: 'num = 7\n# your code here', hints: ['Use num % 2 to check.'], correctAnswer: 'Odd', explanation: '7 % 2 is 1 (not 0), so it\'s odd.' },
        { type: 'code', text: 'Print the result of 10 > 5.', starterCode: 'print(10 > 5)', hints: [], correctAnswer: 'True', explanation: '10 is greater than 5, so this is True.' },
        { type: 'code', text: 'Given score = 75, print "Pass" if score is 40 or above, otherwise "Fail".', starterCode: 'score = 75\n# your code here', hints: ['if score >= 40: ...'], correctAnswer: 'Pass', explanation: '75 is 40 or above, so it passes.' },
        { type: 'code', text: 'Print the result of True and False.', starterCode: 'print(True and False)', hints: [], correctAnswer: 'False', explanation: 'and requires both sides to be True; one is False, so the result is False.' },
        { type: 'code', text: 'Given x = 15, print "Positive" if x > 0, "Negative" if x < 0, otherwise "Zero".', starterCode: 'x = 15\n# your code here', hints: ['Use if/elif/else.'], correctAnswer: 'Positive', explanation: '15 is greater than 0.' },
      ],
    },
  },
  {
    title: 'Loops',
    description: 'for loops, while loops, range.',
    lessons: [
      {
        title: 'Repeating Code with Loops',
        description: 'for loops, while loops, and the range() function.',
        estimatedMinutes: 12,
        content: [
          { type: 'text', text: 'A for loop repeats a block of code once for every item in a sequence. range(n) generates numbers from 0 up to (but not including) n.' },
          {
            type: 'code',
            language: 'python',
            caption: 'loops.py',
            code: `for i in range(5):\n    print("Count:", i)\n\ntotal = 0\nn = 1\nwhile n <= 10:\n    total += n\n    n += 1\nprint("Sum 1-10:", total)`,
          },
        ],
      },
    ],
    exercises: [
      {
        title: 'Sum of Squares',
        instructions: 'Use a for loop and range() to print the square of every number from 1 to 5.',
        starterCode: `for i in range(1, 6):\n    # print i squared`,
        hints: ['i squared is i ** 2 or i * i'],
        expectedOutput: '1\n4\n9\n16\n25',
        difficulty: 'medium',
      },
    ],
    quiz: {
      questions: [
        { type: 'truefalse', text: 'range(5) produces the numbers 1 through 5.', options: [], correctAnswer: 'false', explanation: 'range(5) produces 0, 1, 2, 3, 4 - it stops one before the given number.' },
        { type: 'mcq', text: 'How many times does "for i in range(3):" run its loop body?', options: ['2', '3', '4', 'Infinite'], correctAnswer: '3', explanation: 'range(3) yields 0, 1, 2 - three values, so the loop body runs 3 times.' },
        { type: 'mcq', text: 'Which keyword repeats code as long as a condition stays true?', options: ['for', 'while', 'loop', 'repeat'], correctAnswer: 'while', explanation: 'A while loop keeps running its body as long as its condition evaluates to True.' },
        { type: 'code', text: 'Print numbers 1 to 5 using a for loop, each on its own line.', starterCode: '# your code here', hints: ['for i in range(1, 6): print(i)'], correctAnswer: '1\n2\n3\n4\n5', explanation: 'range(1, 6) yields 1 through 5.' },
        { type: 'code', text: 'Print the sum of numbers 1 to 5 using a loop.', starterCode: 'total = 0\n# your code here', hints: ['Loop with for i in range(1, 6) and add i to total.'], correctAnswer: '15', explanation: '1+2+3+4+5 = 15.' },
        { type: 'code', text: 'Print "Hello" three times using a loop, one per line.', starterCode: '# your code here', hints: ['for _ in range(3): print("Hello")'], correctAnswer: 'Hello\nHello\nHello', explanation: 'Looping 3 times prints the line 3 times.' },
        { type: 'code', text: 'Use a while loop to print 3, 2, 1 (counting down), one per line.', starterCode: 'n = 3\n# your code here', hints: ['while n > 0: print(n); n -= 1'], correctAnswer: '3\n2\n1', explanation: 'Decrementing n each time counts down from 3 to 1.' },
        { type: 'code', text: 'Print only the even numbers from 2 to 10, one per line.', starterCode: '# your code here', hints: ['range(2, 11, 2) steps by 2.'], correctAnswer: '2\n4\n6\n8\n10', explanation: 'Stepping by 2 starting at 2 gives the even numbers up to 10.' },
      ],
    },
  },
  {
    title: 'Functions',
    description: 'Define functions, parameters, return.',
    lessons: [
      {
        title: 'Writing Reusable Functions',
        description: 'def, parameters, return values and default arguments.',
        estimatedMinutes: 12,
        content: [
          { type: 'text', text: 'A function packages a block of code under a name so it can be reused with different inputs (parameters) and give back a result (return).' },
          {
            type: 'code',
            language: 'python',
            caption: 'functions.py',
            code: `def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Sam"))\nprint(greet("Ava", greeting="Hi"))`,
          },
        ],
      },
    ],
    exercises: [
      {
        title: 'Area of a Rectangle',
        instructions: 'Write a function rectangle_area(width, height) that returns width * height. Call it with width=4, height=5 and print the result.',
        starterCode: `def rectangle_area(width, height):\n    # your code here\n    pass\n\nprint(rectangle_area(4, 5))`,
        hints: ['Just multiply the two parameters and return the result.'],
        expectedOutput: '20',
        difficulty: 'easy',
      },
    ],
    quiz: {
      questions: [
        { type: 'mcq', text: 'Which keyword starts a function definition?', options: ['func', 'def', 'function', 'lambda'], correctAnswer: 'def', explanation: 'Functions are defined with the def keyword.' },
        { type: 'mcq', text: 'Which keyword sends a value back from a function to whoever called it?', options: ['return', 'yield only', 'output', 'send'], correctAnswer: 'return', explanation: 'return exits the function and passes a value back to the caller.' },
        { type: 'code', text: 'Write a function add(a, b) that returns a + b. Call add(3, 4) and print the result.', starterCode: 'def add(a, b):\n    # your code here\n    pass\n\nprint(add(3, 4))', hints: ['return a + b'], correctAnswer: '7', explanation: '3 + 4 = 7.' },
        { type: 'code', text: 'Write a function square(n) that returns n * n. Print square(5).', starterCode: 'def square(n):\n    pass\n\nprint(square(5))', hints: ['return n * n'], correctAnswer: '25', explanation: '5 * 5 = 25.' },
        { type: 'code', text: 'Write greet(name) that returns f"Hi, {name}!". Print greet("Sam").', starterCode: 'def greet(name):\n    pass\n\nprint(greet("Sam"))', hints: ['return f"Hi, {name}!"'], correctAnswer: 'Hi, Sam!', explanation: 'f-strings substitute the variable into the string.' },
        { type: 'code', text: 'Write is_even(n) that returns True if n is even. Print is_even(4).', starterCode: 'def is_even(n):\n    pass\n\nprint(is_even(4))', hints: ['return n % 2 == 0'], correctAnswer: 'True', explanation: '4 % 2 is 0, so it\'s even.' },
        { type: 'code', text: 'Write max_of_two(a, b) that returns the larger value. Print max_of_two(3, 9).', starterCode: 'def max_of_two(a, b):\n    pass\n\nprint(max_of_two(3, 9))', hints: ['return a if a > b else b'], correctAnswer: '9', explanation: '9 is larger than 3.' },
      ],
    },
  },
  {
    title: 'Data Structures',
    description: 'Lists, tuples, dictionaries and sets.',
    lessons: [
      {
        title: 'Lists, Tuples, Dictionaries and Sets',
        description: 'The four core collection types and when to reach for each.',
        estimatedMinutes: 14,
        content: [
          { type: 'text', text: 'A list is an ordered, changeable collection - good for anything you will add to, remove from, or reorder.' },
          {
            type: 'code',
            language: 'python',
            caption: 'lists.py',
            code: `groceries = ["milk", "eggs", "bread"]\ngroceries.append("butter")\ngroceries.remove("eggs")\nprint(groceries)\nprint("First item:", groceries[0])`,
          },
          { type: 'text', text: 'A tuple looks similar but is immutable - once created, it cannot be changed. That makes it useful for fixed groupings of values, like coordinates.' },
          {
            type: 'code',
            language: 'python',
            caption: 'tuples.py',
            code: `point = (3, 7)\nx, y = point   # unpacking\nprint("x:", x, "y:", y)`,
          },
          { type: 'text', text: 'A dictionary stores key-value pairs, so you look values up by a meaningful key instead of a numeric position.' },
          {
            type: 'code',
            language: 'python',
            caption: 'dicts.py',
            code: `profile = {"username": "coder21", "level": 3}\nprofile["level"] = 4   # update\nprofile["xp"] = 250    # add a new key\nprint(profile)`,
          },
          { type: 'text', text: 'A set stores unique, unordered values - duplicates are automatically dropped, which makes it useful for membership checks and removing repeats.' },
          {
            type: 'code',
            language: 'python',
            caption: 'sets.py',
            code: `tags = {"python", "beginner", "python"}\nprint(tags)              # duplicate "python" is dropped\nprint("beginner" in tags) # True`,
          },
        ],
      },
    ],
    exercises: [
      {
        title: 'Build a Shopping List',
        instructions: 'Create a list called cart with three item names. Add one more item with append(), then print the final list and its length with len().',
        starterCode: `cart = ["apples", "rice", "soap"]\n# add one more item, then print the list and its length`,
        hints: ['Use cart.append("something") to add an item.'],
        expectedOutput: "['apples', 'rice', 'soap', 'oil']\n4",
        difficulty: 'easy',
      },
    ],
    quiz: {
      questions: [
        { type: 'mcq', text: 'Which collection type cannot be changed after it is created?', options: ['list', 'dict', 'tuple', 'set'], correctAnswer: 'tuple', explanation: 'Tuples are immutable; lists, dicts and sets can all be modified after creation.' },
        { type: 'mcq', text: 'Which collection type automatically removes duplicate values?', options: ['list', 'tuple', 'set', 'dict'], correctAnswer: 'set', explanation: 'A set only keeps unique values - adding a duplicate has no effect.' },
        { type: 'mcq', text: 'How do you access the value for the key "name" in a dictionary called person?', options: ['person(name)', 'person->name', 'person["name"]', 'person.name()'], correctAnswer: 'person["name"]', explanation: 'Dictionary values are accessed with square brackets and the key: person["name"].' },
        { type: 'code', text: 'Create a list nums = [1, 2, 3]. Append 4, then print the list.', starterCode: 'nums = [1, 2, 3]\n# your code here', hints: ['nums.append(4)'], correctAnswer: '[1, 2, 3, 4]', explanation: 'append() adds an item to the end of the list.' },
        { type: 'code', text: 'Given point = (3, 7), print the second value.', starterCode: 'point = (3, 7)\n# your code here', hints: ['Tuples are indexed like lists: point[1].'], correctAnswer: '7', explanation: 'Indexing starts at 0, so point[1] is the second value, 7.' },
        { type: 'code', text: 'Given person = {"name": "Alex"}, print the value for the key "name".', starterCode: 'person = {"name": "Alex"}\n# your code here', hints: ['person["name"]'], correctAnswer: 'Alex', explanation: 'Dictionary values are looked up by their key.' },
        { type: 'code', text: 'Given nums = [1, 2, 2, 3], print how many unique values it has using set() and len().', starterCode: 'nums = [1, 2, 2, 3]\n# your code here', hints: ['len(set(nums)) counts unique values.'], correctAnswer: '3', explanation: 'set(nums) drops the duplicate 2, leaving 3 unique values.' },
        { type: 'code', text: 'Given cart = ["apples", "rice"], print how many items are in it using len().', starterCode: 'cart = ["apples", "rice"]\n# your code here', hints: ['len(cart)'], correctAnswer: '2', explanation: 'The list has 2 items.' },
      ],
    },
  },
];

async function run() {
  await connectDB();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('No admin user found. Run `npm run seed` first.');
    process.exit(1);
  }

  await wipeExistingDemoCourse();

  const course = await Course.create({
    title: DEMO_COURSE_TITLE,
    description: 'A hands-on introduction to Python: the basics, data types, conditionals, loops, functions and data structures - with exercises after every topic.',
    category: 'Python',
    level: 'beginner',
    isPublished: true,
    createdBy: admin._id,
  });

  const week = await Week.create({
    courseId: course._id,
    weekNumber: 1,
    title: 'Python Fundamentals',
    description: 'The core building blocks every Python program is made of.',
    order: 0,
    isPublished: true,
  });

  let lessonCount = 0;
  let exerciseCount = 0;
  let quizCount = 0;
  let questionCount = 0;

  for (const [ti, topicDef] of TOPICS.entries()) {
    const topic = await Topic.create({
      courseId: course._id,
      weekId: week._id,
      title: topicDef.title,
      description: topicDef.description,
      order: ti,
      isPublished: true,
    });

    for (const [li, lessonDef] of topicDef.lessons.entries()) {
      const lesson = await Lesson.create({
        courseId: course._id,
        weekId: week._id,
        topicId: topic._id,
        title: lessonDef.title,
        description: lessonDef.description,
        content: lessonDef.content,
        estimatedMinutes: lessonDef.estimatedMinutes,
        order: li,
        isPublished: true,
      });
      lessonCount += 1;

      // Attach this topic's exercises to its first lesson only, so exercises
      // aren't duplicated across every lesson in a multi-lesson topic.
      if (li === 0) {
        for (const [ei, ex] of (topicDef.exercises || []).entries()) {
          await Exercise.create({
            lessonId: lesson._id,
            courseId: course._id,
            title: ex.title,
            instructions: ex.instructions,
            starterCode: ex.starterCode,
            hints: ex.hints,
            expectedOutput: ex.expectedOutput,
            difficulty: ex.difficulty,
            order: ei,
            isPublished: true,
          });
          exerciseCount += 1;
        }
      }
    }

    // One quiz per topic (not one big end-of-week quiz) - lets a student
    // check their understanding right after finishing that topic.
    if (topicDef.quiz?.questions?.length) {
      const quiz = await Quiz.create({
        courseId: course._id,
        weekId: week._id,
        title: `${topicDef.title} Quiz`,
        description: `Check your understanding of ${topicDef.title.toLowerCase()}.`,
        passPercent: 60,
        order: ti,
        isPublished: true,
      });

      for (const [qi, q] of topicDef.quiz.questions.entries()) {
        await Question.create({ quizId: quiz._id, order: qi, points: 1, ...q });
      }
      quizCount += 1;
      questionCount += topicDef.quiz.questions.length;
    }
  }

  console.log(`Demo course created: "${course.title}" (${course._id})`);
  console.log(`1 week, ${TOPICS.length} topics, ${lessonCount} lessons, ${exerciseCount} exercises, ${quizCount} quizzes with ${questionCount} total questions - all published.`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Demo seed failed:', err);
  process.exit(1);
});
