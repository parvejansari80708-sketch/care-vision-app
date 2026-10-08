export type ModuleId='diabetes'|'heart'|'kidney'|'liver'|'anemia'|'thyroid';
export const MODS=[
  {
    "id": "diabetes",
    "en": "Diabetes",
    "hi": "मधुमेह",
    "ta": "நீரிழிவு",
    "sub": {
      "en": "Track sugar & HbA1c",
      "hi": "शुगर व HbA1c",
      "ta": "சர்க்கரை & HbA1c"
    }
  },
  {
    "id": "heart",
    "en": "Heart",
    "hi": "हृदय",
    "ta": "இதயம்",
    "sub": {
      "en": "Track heart rate",
      "hi": "हृदय गति",
      "ta": "இதய துடிப்பு"
    }
  },
  {
    "id": "kidney",
    "en": "Kidney",
    "hi": "गुर्दा",
    "ta": "சிறுநீரகம்",
    "sub": {
      "en": "Track filtration",
      "hi": "निस्पंदन",
      "ta": "வடிகட்டுதல்"
    }
  },
  {
    "id": "liver",
    "en": "Liver",
    "hi": "यकृत",
    "ta": "கல்லீரல்",
    "sub": {
      "en": "Track liver health",
      "hi": "यकृत स्वास्थ्य",
      "ta": "கல்லீரல் நலம்"
    }
  },
  {
    "id": "anemia",
    "en": "Anemia",
    "hi": "एनीमिया",
    "ta": "இரத்த சோகை",
    "sub": {
      "en": "Track hemoglobin",
      "hi": "हीमोग्लोबिन",
      "ta": "ஹீமோகுளோபின்"
    }
  },
  {
    "id": "thyroid",
    "en": "Thyroid",
    "hi": "थायरॉइड",
    "ta": "தைராய்டு",
    "sub": {
      "en": "Track TSH levels",
      "hi": "TSH स्तर",
      "ta": "TSH அளவு"
    }
  }
];
export const ASSESS_Q: Record<string,[string,string[]][] >={
  diabetes:[["Age group?",["Under 35","35–50","Above 50"]],["Family history of diabetes?",["No","Yes — one parent","Yes — both / sibling"]],["How often do you exercise?",["5+ days/week","2–4 days/week","Rarely"]],["Usual diet?",["Balanced","Often sugary / fried","Mostly processed"]],["Known blood sugar readings?",["Normal","Borderline","High / diabetic"]]],
  heart:[["Age group?",["Under 35","35–50","Above 50"]],["Smoking / tobacco?",["Never","Occasionally","Regularly"]],["Blood pressure known?",["Normal","Borderline","High"]],["Chest discomfort on exertion?",["Never","Sometimes","Often"]],["Family history of heart disease?",["No","Yes"]]],
  kidney:[["Age group?",["Under 40","40–60","Above 60"]],["Blood pressure?",["Normal","Borderline","High"]],["Diabetes?",["No","Borderline","Yes"]],["Swelling in feet / face?",["Never","Sometimes","Often"]],["Urination changes?",["No","Yes — frequency","Yes — color/foam"]]],
  liver:[["Alcohol use?",["Never","Occasionally","Regularly"]],["Known fatty liver?",["No","Suspected","Diagnosed"]],["Fatigue / heaviness after meals?",["Rarely","Sometimes","Often"]],["Medication / supplement load?",["Minimal","Moderate","Heavy"]]],
  anemia:[["Often feel tired / weak?",["Rarely","Sometimes","Often"]],["Pale skin / nails noticed?",["No","Sometimes","Yes"]],["Diet rich in iron?",["Yes","Average","Poor"]],["Known hemoglobin level?",["Normal","Low-normal","Low"]]],
  thyroid:[["Unexplained weight change?",["No","Slight","Significant"]],["Fatigue despite sleep?",["Rarely","Sometimes","Often"]],["Hair fall / dry skin?",["No","Mild","Noticeable"]],["Family history of thyroid?",["No","Yes"]]],
};
export const RECO: Record<string,Record<string,string[]>>={
  diabetes:{en:["Walk 30 min daily after meals","Cut sugary drinks; prefer whole grains","Recheck HbA1c every 3–6 months"],hi:["रोज़ खाने के बाद 30 मिनट टहलें","मीठे पेय छोड़ें; साबुत अनाज चुनें","हर 3–6 महीने में HbA1c जांचें"],ta:["சாப்பாட்டிற்குப் பிறகு தினமும் 30 நிமிடம் நடக்கவும்","சர்க்கரை பானங்களைத் தவிர்க்கவும்","3–6 மாதங்களுக்கு ஒருமுறை HbA1c பரிசோதிக்கவும்"]},
  heart:{en:["150 min moderate activity / week","Less salt & fried food; more fibre","Monitor BP monthly"],hi:["सप्ताह में 150 मिनट मध्यम व्यायाम","नमक व तला भोजन कम; फाइबर अधिक","मासिक BP जांचें"],ta:["வாரத்திற்கு 150 நிமிட மிதமான உடற்பயிற்சி","உப்பு & பொரித்த உணவு குறைவு","மாதந்தோறும் BP கண்காணிக்கவும்"]},
  kidney:{en:["Keep BP & sugar in range","2–2.5 L water daily (unless restricted)","Avoid frequent painkillers"],hi:["BP व शुगर नियंत्रित रखें","रोज़ 2–2.5 लीटर पानी (यदि मना न हो)","बार-बार दर्द निवारक न लें"],ta:["BP & சர்க்கரையைக் கட்டுப்படுத்தவும்","தினமும் 2–2.5 லி நீர்","அடிக்கடி வலி நிவாரணிகளைத் தவிர்க்கவும்"]},
  liver:{en:["Avoid alcohol; limit fatty food","Maintain healthy weight","Annual liver function test"],hi:["शराब से बचें; तैलीय भोजन कम करें","स्वस्थ वज़न बनाए रखें","वार्षिक लिवर फंक्शन टेस्ट"],ta:["மதுவைத் தவிர்க்கவும்","ஆரோக்கியமான எடையைப் பராமரிக்கவும்","ஆண்டு கல்லீரல் செயல்பாடு பரிசோதனை"]},
  anemia:{en:["Iron-rich foods + vitamin C","Avoid tea/coffee with meals","Recheck hemoglobin in 3 months"],hi:["आयरन युक्त भोजन + विटामिन C","खाने के साथ चाय/कॉफी न लें","3 महीने में हीमोग्लोबिन दोबारा जांचें"],ta:["இரும்புச்சத்து உணவு + வைட்டமின் C","சாப்பாட்டுடன் டீ/காபி தவிர்க்கவும்","3 மாதங்களில் ஹீமோகுளோபின் மீண்டும் பரிசோதிக்கவும்"]},
  thyroid:{en:["Annual TSH screening","Adequate iodine & selenium","Track weight & energy monthly"],hi:["वार्षिक TSH जांच","पर्याप्त आयोडीन व सेलेनियम","मासिक वज़न व ऊर्जा ट्रैक करें"],ta:["ஆண்டு TSH பரிசோதனை","போதுமான அயோடின் & செலினியம்","மாதந்தோறும் எடை & ஆற்றலைக் கண்காணிக்கவும்"]},
};
