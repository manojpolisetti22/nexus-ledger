import { CATEGORIES, PAYMENT_METHODS } from '../types.js';

/**
 * Intelligent Dual-Engine Natural Language Expense Parser
 * 1. Gemini AI Flash Engine (Online high-accuracy structured JSON)
 * 2. High-Performance Local Heuristic Engine (Offline zero-latency fallback)
 */

export async function parseExpensePrompt(text, apiKey = '', preferredModel = 'gemini-2.5-flash') {
  if (!text || !text.trim()) {
    throw new Error('Please enter or dictate an expense description.');
  }

  const cleanText = text.trim();

  // If API key is provided, attempt Gemini extraction first
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const geminiResult = await parseWithGemini(cleanText, apiKey.trim(), preferredModel);
      if (geminiResult && geminiResult.amount) {
        return {
          ...geminiResult,
          engine: 'Gemini 2.5 Flash (Cloud AI)',
          rawInput: cleanText
        };
      }
    } catch (err) {
      console.warn('Gemini AI parsing failed, falling back to local engine:', err);
    }
  }

  // Fallback to robust local offline parser
  const localResult = parseLocally(cleanText);
  return {
    ...localResult,
    engine: 'Nexus Quantum Local NLP (Offline Engine)',
    rawInput: cleanText
  };
}

/**
 * Gemini Flash API Call
 */
async function parseWithGemini(text, apiKey, model = 'gemini-2.5-flash') {
  const today = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const systemInstruction = `You are a financial parsing assistant in a mobile expense app.
Current date: ${today} (${dayName}).
The user will input an on-the-go spoken or typed expense description (e.g., "Paid 150 for office supplies at Staples yesterday", "Lunch with client Dave $45").
Extract structured JSON with EXACTLY these fields:
- amount: number (e.g. 150.00, never null or 0 if mentioned)
- payee: string (person, vendor, or store paid, e.g. "Staples", "Dave", "Chevron")
- category: string (must be one of: "Office Supplies", "Meals & Dining", "Travel & Fuel", "Tech & Software", "Utilities & Services", "Marketing & Ads", "Health & Safety", "Miscellaneous")
- date: string (format YYYY-MM-DD, infer relative words like "yesterday", "last friday", or default to today: "${today}")
- paymentMethod: string (one of: "Company Card", "Personal Card", "Cash", "Bank Transfer (ACH)", "Digital Wallet (Apple/Google Pay)")
- notes: string (items purchased, details, or meeting purpose)`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

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
  return {
    amount: Number(parsed.amount) || 0,
    payee: parsed.payee || 'Expense',
    category: matchCategory(parsed.category),
    date: parsed.date || today,
    paymentMethod: parsed.paymentMethod || 'Company Card',
    notes: parsed.notes || ''
  };
}

/**
 * High-Precision Offline Heuristic Parser
 */
export function parseLocally(text) {
  const lower = text.toLowerCase();
  const today = new Date();
  let expenseDate = today.toISOString().split('T')[0];

  // 1. Amount Extraction
  // Matches "$150", "150.50", "150 dollars", "paid 150", "150 for"
  let amount = 0;
  const amountPatterns = [
    /[$€£₹]\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
    /([0-9]+(?:\.[0-9]{1,2})?)\s*(?:dollars|bucks|usd|eur|gbp|inr)/i,
    /(?:paid|spent|cost|giving|gave)\s+([0-9]+(?:\.[0-9]{1,2})?)/i,
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

  // 3. Category Determination via weighted semantic keywords
  let category = 'Miscellaneous';
  let categoryScore = 0;

  const keywordMap = [
    {
      cat: 'Office Supplies',
      words: ['office', 'supplies', 'paper', 'printer', 'ink', 'pen', 'pens', 'staples', 'desk', 'folder', 'stationery', 'postage', 'envelope']
    },
    {
      cat: 'Meals & Dining',
      words: ['lunch', 'dinner', 'breakfast', 'food', 'restaurant', 'cafe', 'coffee', 'starbucks', 'bistro', 'burger', 'pizza', 'meal', 'drinks', 'client dinner', 'snack', 'diner']
    },
    {
      cat: 'Travel & Fuel',
      words: ['gas', 'fuel', 'petrol', 'diesel', 'chevron', 'shell', 'exxon', 'bp', 'uber', 'lyft', 'taxi', 'cab', 'parking', 'toll', 'flight', 'airline', 'hotel', 'airbnb', 'mileage']
    },
    {
      cat: 'Tech & Software',
      words: ['software', 'subscription', 'github', 'aws', 'cloud', 'domain', 'hosting', 'figma', 'openai', 'gemini', 'adobe', 'laptop', 'monitor', 'keyboard', 'app', 'license', 'saas']
    },
    {
      cat: 'Utilities & Services',
      words: ['electricity', 'water', 'internet', 'wifi', 'cleaning', 'phone', 'verizon', 't-mobile', 'at&t', 'rent', 'storage', 'repair', 'maintenance']
    },
    {
      cat: 'Marketing & Ads',
      words: ['ad', 'ads', 'google ads', 'facebook ads', 'instagram', 'marketing', 'flyer', 'business card', 'promo', 'branding', 'logo', 'sponsorship']
    },
    {
      cat: 'Health & Safety',
      words: ['medical', 'doctor', 'clinic', 'first aid', 'mask', 'sanitizer', 'safety', 'pharmacy', 'medicine', 'glove']
    }
  ];

  for (const item of keywordMap) {
    let score = 0;
    for (const w of item.words) {
      if (lower.includes(w)) score += 1;
    }
    if (score > categoryScore) {
      categoryScore = score;
      category = item.cat;
    }
  }

  // 4. Payee Extraction
  // Look for "at [Merchant]", "to [Person]", "from [Vendor]", "paid [Person] [Amount]"
  let payee = '';
  const payeePatterns = [
    /\bpaid\s+([A-Z][a-zA-Z0-9'\s&]+?)(?=\s+(?:for|\$|[0-9]))/i,
    /\bat\s+([A-Z][a-zA-Z0-9'\s&]+?)(?=\s+(?:yesterday|today|last|for|on|\$|[0-9]|$))/i,
    /\bto\s+([A-Z][a-zA-Z0-9'\s&]+?)(?=\s+(?:yesterday|today|last|for|on|\$|[0-9]|$))/i,
    /\bfrom\s+([A-Z][a-zA-Z0-9'\s&]+?)(?=\s+(?:yesterday|today|last|for|on|\$|[0-9]|$))/i,
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
    const brands = ['Staples', 'Chevron', 'Shell', 'Costco', 'Walmart', 'Home Depot', 'Amazon', 'Target', 'Starbucks', 'Uber', 'Lyft', 'GitHub', 'Google', 'Apple'];
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(text)) {
        payee = b;
        break;
      }
    }
  }

  // If still empty, derive from category or text
  if (!payee) {
    if (category !== 'Miscellaneous') {
      payee = category;
    } else {
      payee = 'Quick Expense';
    }
  }

  // 5. Payment Method
  let paymentMethod = 'Company Card';
  if (lower.includes('cash')) paymentMethod = 'Cash';
  else if (lower.includes('personal card') || lower.includes('personal')) paymentMethod = 'Personal Card';
  else if (lower.includes('apple pay') || lower.includes('google pay')) paymentMethod = 'Digital Wallet (Apple/Google Pay)';
  else if (lower.includes('transfer') || lower.includes('ach') || lower.includes('wire')) paymentMethod = 'Bank Transfer (ACH)';

  // 6. Notes Formatting & Normalization
  let notes = text;
  notes = notes.replace(/[$€£₹]?\s*[0-9]+(?:\.[0-9]{1,2})?\s*(?:dollars|bucks)?/gi, ' ');
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
    notes: notes || text
  };
}

function cleanMerchant(str) {
  return str.replace(/\b(yesterday|today|dollars|bucks|supplies)\b/gi, '').trim();
}

function matchCategory(input) {
  if (!input) return 'Miscellaneous';
  const found = CATEGORIES.find(c => c.name.toLowerCase() === input.toLowerCase());
  return found ? found.name : 'Miscellaneous';
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
