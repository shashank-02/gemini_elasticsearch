const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = 'AIzaSyB3y_1-YaucUsPQZSK2caBOylk8DwCUPeQ';

const genAI = new GoogleGenerativeAI(API_KEY);

async function run(query) 
{
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = `You are good at generating JSON Output from the given input.
  Give me the JSON output for the following query.
  QUERY - ${query}
  
  The JSON should be in the form of the following template. If you can't find the match for the specified field from the given input, generate relevant values only for job_title and sector. Consider others as "Null".
{
    "job_title":[],
    "sector":[],
    "company":[],
    "location":[],
    "work_type":[],
    "salary_minimum":integer,
    "salary_maximum":integer,
    "job_security":"",
    "job_demand":"",
    "qualifications":[],
    "experience":integer
}`

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}

const readline = require('readline');

const rl = readline.createInterface(
{
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter search query: ', (userInput) => 
{
  const res = run(userInput);
  console.log(res);
  rl.close();
});
