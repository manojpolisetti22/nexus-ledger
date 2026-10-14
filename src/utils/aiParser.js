import { CATEGORIES, PAYMENT_METHODS } from '../types.js';
import { loadCategories, loadLearnedRules } from './storage.js';

/**
 * Intelligent Adaptive Natural Language Expense Parser
 * 1. Learned User Memory Engine (Matches past edits & personalized rules)
 * 2. Gemini AI Flash Engine (Online high-accuracy structured JSON with dynamic categories)
 * 3. High-Performance Local Heuristic Engine (Offline zero-latency fallback)
 */

export async function parseExpensePrompt(
  text, 
  apiKey = '', 
  preferredModel = 'gemini-1.5-flash',
  customCategories = null,
  learnedRules = null
) {
  if (!text || !text.trim()) {
    throw new Error('Please enter or dictate an expense description.');
  }

  const cleanText = text.trim();
  const activeCategories = customCategories && customCategories.length > 0 ? customCategories : loadCategories();
  const activeRules = learnedRules && Array.isArray(learnedRules) ? learnedRules : loadLearnedRules();

  // If API key is provided, attempt Gemini extraction with custom categories & learned examples
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const geminiResult = await parseWithGemini(cleanText, apiKey.trim(), preferredModel, activeCategories, activeRules);
      if (geminiResult && geminiResult.amount) {
        return {
          ...geminiResult,
          engine: 'Gemini Flash (Adaptive Cloud AI)',
          rawInput: cleanText
        };
      }
    } catch (err) {
      console.warn('Gemini AI parsing failed, falling back to local engine:', err);
    }
  }

  // Fallback to robust adaptive local offline parser
  const localResult = parseLocally(cleanText, activeCategories, activeRules);
  return {
    ...localResult,
    engine: localResult.learnedMatch ? 'Nexus Adaptive Memory (Learned Preference)' : 'Nexus Quantum Local NLP (Offline Engine)',
    rawInput: cleanText
  };
}

/**
 * Gemini Flash API Call with Dynamic Categories & Few-Shot Learned Context
 */
async function parseWithGemini(text, apiKey, model = 'gemini-1.5-flash', categories = CATEGORIES, learnedRules = []) {
  const today = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const categoryNames = categories.map(c => `"${c.name}"`).join(', ');
  
  // Format top 10 learned rules as few-shot guide for Gemini
  let learnedContext = '';
  if (learnedRules && learnedRules.length > 0) {
    const rulesList = learnedRules.slice(0, 15).map(r => `"${r.pattern}" -> Category: "${r.category}"`).join('; ');
    learnedContext = `\nCRITICAL USER LEARNED RULES (Always honor these specific user categorizations):\n${rulesList}`;
  }

  const systemInstruction = `You are a financial parsing assistant in a mobile expense app.
Current date: ${today} (${dayName}).
The user will input an on-the-go spoken or typed expense description (e.g., "Paid 150 for office supplies at Staples yesterday", "Lunch with client Dave ₹450", "Auto ride 120 rs").
Extract structured JSON with EXACTLY these fields:
- amount: number (e.g. 150.00, never null or 0 if mentioned)
- payee: string (person, vendor, or store paid, e.g. "Staples", "Dave", "Swiggy", "Zomato", "Chevron")
- category: string (MUST BE STRICTLY ONE OF THE USER'S CONFIGURED CATEGORIES: [ ${categoryNames} ])
- date: string (format YYYY-MM-DD, infer relative words like "yesterday", "last friday", or default to today: "${today}")
- paymentMethod: string (one of: "Company Card", "Personal Card", "Cash", "Bank Transfer (ACH)", "Digital Wallet (Apple/Google Pay)")
- notes: string (items purchased, details, or meeting purpose)${learnedContext}`;

  let targetModel = model;
  if (!targetModel || targetModel.includes('2.5')) {
    targetModel = 'gemini-1.5-flash';
  }

  let url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    }
  };

  let response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // If 404 model not found, try resilient fallback to gemini-1.5-flash
  if (response.status === 404 && targetModel !== 'gemini-1.5-flash') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const json = await response.json();
  const rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawContent) {
    throw new Error('Empty response from Gemini');
  }

  const parsed = JSON.parse(rawContent);

  // Check if a learned rule directly overrides the category
  const lower = text.toLowerCase();
  let finalCategory = matchCategory(parsed.category, categories);
  let learnedMatch = false;

  for (const rule of learnedRules) {
    if (lower.includes(rule.pattern.toLowerCase())) {
      finalCategory = rule.category;
      learnedMatch = true;
      break;
    }
  }

  return {
    amount: Number(parsed.amount) || 0,
    payee: parsed.payee || 'Expense',
    category: finalCategory,
    date: parsed.date || today,
    paymentMethod: parsed.paymentMethod || 'Company Card',
    notes: parsed.notes || '',
    learnedMatch
  };
}

/**
 * High-Precision Offline Heuristic Parser with Adaptive Learning
 */
export function parseLocally(text, categories = CATEGORIES, learnedRules = []) {
  const lower = text.toLowerCase();
  const today = new Date();
  let expenseDate = today.toISOString().split('T')[0];

  // 1. Amount Extraction (supports $, ₹, €, £, rs, rupees, inr, bucks, dollars)
  let amount = 0;
  const amountPatterns = [
    /[$€£₹]\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
    /(?:rs\.?|inr|rupees)\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
    /([0-9]+(?:\.[0-9]{1,2})?)\s*(?:rs\.?|rupees|inr|dollars|bucks|usd|eur|gbp)/i,
    /(?:paid|spent|cost|giving|gave|for)\s+([0-9]+(?:\.[0-9]{1,2})?)/i,
    /\b([0-9]+(?:\.[0-9]{1,2})?)\b/
  ];

  for (const regex of amountPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) {
        amount = val;
        break;
      }
    }
  }

  // 2. Relative Date Resolution
  if (lower.includes('yesterday')) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    expenseDate = d.toISOString().split('T')[0];
  } else if (lower.includes('day before yesterday')) {
    const d = new Date(today);
    d.setDate(d.getDate() - 2);
    expenseDate = d.toISOString().split('T')[0];
  } else if (lower.includes('last friday')) {
    expenseDate = getPreviousDayOfWeek(5);
  } else if (lower.includes('last monday')) {
    expenseDate = getPreviousDayOfWeek(1);
  } else if (lower.includes('last week')) {
    const d = new Date(today);
    d.setDate(d.getDate() - 7);
    expenseDate = d.toISOString().split('T')[0];
  }

  // 3. Category Determination (Step A: Check User Learned Rules First!)
  let category = '';
  let learnedMatch = false;

  if (Array.isArray(learnedRules)) {
    for (const rule of learnedRules) {
      if (rule.pattern && lower.includes(rule.pattern.toLowerCase())) {
        // Ensure the learned category is still in active categories
        const exists = categories.some(c => c.name.toLowerCase() === rule.category.toLowerCase());
        if (exists) {
          category = rule.category;
          learnedMatch = true;
          break;
        }
      }
    }
  }

  // Step B: Direct Category Name Match (e.g. if text mentions "groceries" and category "Groceries" exists)
  if (!category) {
    for (const cat of categories) {
      const catLower = cat.name.toLowerCase();
      // Match whole category name or significant words
      const words = catLower.split(/[\s&/]+/).filter(w => w.length > 2);
      if (words.some(w => lower.includes(w))) {
        category = cat.name;
        break;
      }
    }
  }

  // Step C: Weighted Semantic Keyword Match
  if (!category) {
    const keywordMap = [
      {
        names: ['Meals & Dining', 'Food', 'Dining', 'Meals', 'Groceries'],
        words: ['lunch', 'dinner', 'breakfast', 'food', 'restaurant', 'cafe', 'coffee', 'starbucks', 'bistro', 'burger', 'pizza', 'meal', 'drinks', 'snack', 'diner', 'swiggy', 'zomato', 'chai', 'tea', 'groceries', 'supermarket', 'subway', 'mcdonalds', 'kfc']
      },
      {
        names: ['Travel & Fuel', 'Travel', 'Fuel', 'Transportation', 'Transport'],
        words: ['gas', 'fuel', 'petrol', 'diesel', 'chevron', 'shell', 'exxon', 'bp', 'uber', 'lyft', 'ola', 'auto', 'taxi', 'cab', 'parking', 'toll', 'flight', 'airline', 'hotel', 'airbnb', 'mileage', 'metro', 'train', 'bus']
      },
      {
        names: ['Office Supplies', 'Office', 'Supplies', 'Stationery'],
        words: ['office', 'supplies', 'paper', 'printer', 'ink', 'pen', 'pens', 'staples', 'desk', 'folder', 'stationery', 'postage', 'envelope']
      },
      {
        names: ['Tech & Software', 'Software', 'Tech', 'IT', 'Subscriptions'],
        words: ['software', 'subscription', 'github', 'aws', 'cloud', 'domain', 'hosting', 'figma', 'openai', 'gemini', 'adobe', 'laptop', 'monitor', 'keyboard', 'app', 'license', 'saas', 'chatgpt', 'netflix', 'spotify']
      },
      {
        names: ['Utilities & Services', 'Utilities', 'Services', 'Bills'],
        words: ['electricity', 'water', 'internet', 'wifi', 'cleaning', 'phone', 'verizon', 't-mobile', 'at&t', 'airtel', 'jio', 'rent', 'storage', 'repair', 'maintenance', 'bill', 'electric']
      },
      {
        names: ['Marketing & Ads', 'Marketing', 'Advertising'],
        words: ['ad', 'ads', 'google ads', 'facebook ads', 'instagram', 'marketing', 'flyer', 'business card', 'promo', 'branding', 'logo', 'sponsorship', 'seo']
      },
      {
        names: ['Health & Safety', 'Health', 'Medical', 'Fitness'],
        words: ['medical', 'doctor', 'clinic', 'first aid', 'mask', 'sanitizer', 'safety', 'pharmacy', 'medicine', 'glove', 'gym', 'workout', 'hospital']
      }
    ];

    let bestScore = 0;
    let bestCatName = '';

    for (const item of keywordMap) {
      // Find if any configured category matches item.names
      const targetCat = categories.find(c => item.names.some(n => n.toLowerCase() === c.name.toLowerCase()));
      if (targetCat) {
        let score = 0;
        for (const w of item.words) {
          if (lower.includes(w)) score += 1;
        }
        if (score > bestScore) {
          bestScore = score;
          bestCatName = targetCat.name;
        }
      }
    }

    if (bestScore > 0) {
      category = bestCatName;
    }
  }

  // Fallback to Miscellaneous or first category
  if (!category) {
    const misc = categories.find(c => c.name.toLowerCase().includes('misc'));
    category = misc ? misc.name : (categories[0]?.name || 'Miscellaneous');
  }

  // 4. Payee Extraction
  let payee = '';
  const payeePatterns = [
    /\bpaid\s+([A-Z][a-zA-Z0-9'\s&]+?)(?=\s+(?:for|\$|₹|rs|[0-9]))/i,
    /\bat\s+([A-Z][a-zA-Z0-9'\s&]+?)(?=\s+(?:yesterday|today|last|for|on|\$|₹|rs|[0-9]|$))/i,
    /\bto\s+([A-Z][a-zA-Z0-9'\s&]+?)(?=\s+(?:yesterday|today|last|for|on|\$|₹|rs|[0-9]|$))/i,
    /\bfrom\s+([A-Z][a-zA-Z0-9'\s&]+?)(?=\s+(?:yesterday|today|last|for|on|\$|₹|rs|[0-9]|$))/i,
  ];

  for (const regex of payeePatterns) {
    const m = text.match(regex);
    if (m && m[1] && m[1].trim()) {
      const candidate = cleanMerchant(m[1].trim());
      if (candidate.toLowerCase() !== 'for' && candidate.length > 1) {
        payee = candidate;
        break;
      }
    }
  }

  // If no "at/to/from/paid", check for known brands
  if (!payee) {
    const brands = [
      'Staples', 'Chevron', 'Shell', 'Costco', 'Walmart', 'Home Depot', 
      'Amazon', 'Target', 'Starbucks', 'Uber', 'Ola', 'Swiggy', 'Zomato', 
      'GitHub', 'Google', 'Apple', 'Airtel', 'Jio', 'Blinkit', 'Zepto'
    ];
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(text)) {
        payee = b;
        break;
      }
    }
  }

  if (!payee) {
    if (category && category !== 'Miscellaneous') {
      payee = category;
    } else {
      payee = 'Quick Expense';
    }
  }

  // 5. Payment Method
  let paymentMethod = 'Company Card';
  if (lower.includes('cash')) paymentMethod = 'Cash';
  else if (lower.includes('personal card') || lower.includes('personal')) paymentMethod = 'Personal Card';
  else if (lower.includes('apple pay') || lower.includes('google pay') || lower.includes('upi') || lower.includes('paytm') || lower.includes('gpay')) paymentMethod = 'Digital Wallet (Apple/Google Pay)';
  else if (lower.includes('transfer') || lower.includes('ach') || lower.includes('wire') || lower.includes('neft') || lower.includes('rtgs')) paymentMethod = 'Bank Transfer (ACH)';

  // 6. Notes Formatting & Normalization
  let notes = text;
  notes = notes.replace(/[$€£₹]?\s*[0-9]+(?:\.[0-9]{1,2})?\s*(?:dollars|bucks|rupees|rs|inr)?/gi, ' ');
  notes = notes.replace(/\s{2,}/g, ' ').trim();
  notes = notes.replace(/^(?:paid|spent|cost)\s+(?:for|on)?\s*/i, '').trim();
  if (notes.length > 0) {
    notes = notes.charAt(0).toUpperCase() + notes.slice(1);
  } else {
    notes = text;
  }

  return {
    amount: amount || 0,
    payee,
    category,
    date: expenseDate,
    paymentMethod,
    notes: notes || text,
    learnedMatch
  };
}

function cleanMerchant(str) {
  return str.replace(/\b(yesterday|today|dollars|bucks|rupees|rs|supplies)\b/gi, '').trim();
}

function matchCategory(input, categories = CATEGORIES) {
  if (!input) return categories[0]?.name || 'Miscellaneous';
  const found = categories.find(c => c.name.toLowerCase() === input.toLowerCase());
  return found ? found.name : (categories[0]?.name || 'Miscellaneous');
}

function getPreviousDayOfWeek(dayOfWeek) {
  const d = new Date();
  const currentDay = d.getDay();
  let distance = currentDay - dayOfWeek;
  if (distance <= 0) {
    distance += 7;
  }
  d.setDate(d.getDate() - distance);
  return d.toISOString().split('T')[0];
}
