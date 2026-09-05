import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const questions = [
  {
    category: "Cardiology",
    stem: "A 58-year-old man presents with substernal chest pressure radiating to his left arm that began 45 minutes ago. ECG shows ST-segment elevation in leads II, III, and aVF. Which coronary artery is most likely occluded?",
    choices: ["Left anterior descending artery", "Right coronary artery", "Left circumflex artery", "Left main coronary artery"],
    correctIndex: 1,
    explanation: "ST elevation in the inferior leads (II, III, aVF) localizes the infarct to the inferior wall, which is most commonly supplied by the right coronary artery.",
  },
  {
    category: "Cardiology",
    stem: "A 68-year-old woman with a history of hypertension develops sudden dyspnea and a new holosystolic murmur best heard at the apex three days after an anterior MI. What is the most likely diagnosis?",
    choices: ["Papillary muscle rupture", "Ventricular septal rupture", "Free wall rupture", "Pericarditis"],
    correctIndex: 0,
    explanation: "Papillary muscle rupture causes acute mitral regurgitation with a new holosystolic murmur at the apex, typically 2-7 days post-MI.",
  },
  {
    category: "Pulmonology",
    stem: "A 24-year-old previously healthy man presents with sudden-onset unilateral pleuritic chest pain and dyspnea. He is tall and thin. Chest X-ray shows absent lung markings on the right with a visible pleural line. What is the diagnosis?",
    choices: ["Pulmonary embolism", "Spontaneous pneumothorax", "Pneumonia", "Pleural effusion"],
    correctIndex: 1,
    explanation: "Primary spontaneous pneumothorax classically occurs in tall, thin young men and presents with sudden pleuritic pain and absent lung markings on imaging.",
  },
  {
    category: "Pulmonology",
    stem: "A 45-year-old woman with a history of COPD presents with worsening dyspnea, purulent sputum, and increased cough for 2 days. She is afebrile and hemodynamically stable. What is the most appropriate initial management?",
    choices: ["ICU admission and intubation", "Outpatient bronchodilators and a short course of antibiotics", "CT pulmonary angiography", "Long-term home oxygen therapy"],
    correctIndex: 1,
    explanation: "A mild COPD exacerbation with increased sputum purulence in a stable patient is typically managed as an outpatient with bronchodilators and antibiotics.",
  },
  {
    category: "Gastroenterology",
    stem: "A 50-year-old man with a history of heavy alcohol use presents with severe epigastric pain radiating to the back, nausea, and vomiting. Lipase is elevated 5-fold. What is the most appropriate initial step in management?",
    choices: ["Aggressive IV fluid resuscitation", "Emergency ERCP", "Broad-spectrum antibiotics", "Immediate surgical debridement"],
    correctIndex: 0,
    explanation: "Aggressive IV fluid resuscitation is the cornerstone of initial management for acute pancreatitis, regardless of etiology.",
  },
  {
    category: "Gastroenterology",
    stem: "A 45-year-old woman presents with right upper quadrant pain, fever, and jaundice. Ultrasound shows a dilated common bile duct with a stone. What is this triad of findings called?",
    choices: ["Virchow's triad", "Charcot's triad", "Beck's triad", "Cushing's triad"],
    correctIndex: 1,
    explanation: "Charcot's triad (RUQ pain, fever, jaundice) is classic for ascending cholangitis caused by biliary obstruction.",
  },
  {
    category: "Endocrinology",
    stem: "A 29-year-old woman with type 1 diabetes presents with nausea, vomiting, abdominal pain, and confusion. Glucose is 450 mg/dL, and arterial blood gas shows a pH of 7.15 with elevated anion gap. What is the most appropriate first step in management?",
    choices: ["IV insulin bolus", "IV isotonic saline", "IV sodium bicarbonate", "Subcutaneous insulin"],
    correctIndex: 1,
    explanation: "In DKA, the first priority is fluid resuscitation with isotonic saline before starting insulin, to correct volume depletion and prevent worsening hypotension.",
  },
  {
    category: "Endocrinology",
    stem: "A 35-year-old woman presents with weight loss, palpitations, heat intolerance, and a fine tremor. TSH is undetectable and free T4 is elevated. On exam she has exophthalmos. What is the most likely diagnosis?",
    choices: ["Toxic multinodular goiter", "Graves disease", "Subacute thyroiditis", "Thyroid storm"],
    correctIndex: 1,
    explanation: "Graves disease is the most common cause of hyperthyroidism and is uniquely associated with exophthalmos due to autoimmune orbital involvement.",
  },
  {
    category: "Infectious Disease",
    stem: "A 22-year-old college student presents with fever, neck stiffness, photophobia, and a petechial rash. What is the most appropriate immediate step?",
    choices: ["Obtain CT head before lumbar puncture", "Start empiric antibiotics immediately", "Await blood culture results before treatment", "Discharge with outpatient follow-up"],
    correctIndex: 1,
    explanation: "Suspected bacterial meningitis (fever, meningismus, petechial rash suggesting meningococcemia) requires immediate empiric antibiotics; treatment should not be delayed for imaging or LP.",
  },
  {
    category: "Infectious Disease",
    stem: "A 30-year-old man returns from a camping trip and presents with an expanding erythematous rash with central clearing on his thigh, along with fatigue and low-grade fever. What is the most likely diagnosis?",
    choices: ["Rocky Mountain spotted fever", "Lyme disease", "Cellulitis", "Erythema multiforme"],
    correctIndex: 1,
    explanation: "Erythema migrans (expanding rash with central clearing) after outdoor exposure is classic for early localized Lyme disease.",
  },
  {
    category: "Nephrology",
    stem: "A 60-year-old man with a history of hypertension has a creatinine that rose from 1.0 to 2.5 mg/dL two days after starting an ACE inhibitor and an NSAID. What is the most likely underlying cause?",
    choices: ["Acute interstitial nephritis", "Bilateral renal artery stenosis", "Acute tubular necrosis", "Minimal change disease"],
    correctIndex: 1,
    explanation: "A sharp creatinine rise after starting an ACE inhibitor suggests bilateral renal artery stenosis, since glomerular filtration in these kidneys depends on angiotensin II-mediated efferent arteriolar constriction.",
  },
  {
    category: "Nephrology",
    stem: "A 26-year-old woman presents with edema, foamy urine, and a 24-hour urine protein of 4.5 g. Serum albumin is low and cholesterol is elevated. What syndrome does this describe?",
    choices: ["Nephritic syndrome", "Nephrotic syndrome", "Acute kidney injury", "Renal tubular acidosis"],
    correctIndex: 1,
    explanation: "Heavy proteinuria (>3.5 g/day), hypoalbuminemia, edema, and hyperlipidemia define nephrotic syndrome.",
  },
  {
    category: "Neurology",
    stem: "A 70-year-old man presents with sudden right-sided weakness and expressive aphasia that began 90 minutes ago. CT head shows no hemorrhage. What is the most appropriate next step?",
    choices: ["Start aspirin and admit for observation", "Administer IV tissue plasminogen activator", "MRI brain before any treatment", "Start heparin infusion"],
    correctIndex: 1,
    explanation: "In an ischemic stroke presenting within the tPA window with no contraindications (and hemorrhage excluded by CT), IV tPA should be administered promptly.",
  },
  {
    category: "Neurology",
    stem: "A 35-year-old woman presents with episodic unilateral, pulsating headaches associated with nausea and photophobia, lasting 6-24 hours, preceded by visual scintillations. What is the most likely diagnosis?",
    choices: ["Tension headache", "Cluster headache", "Migraine with aura", "Trigeminal neuralgia"],
    correctIndex: 2,
    explanation: "Unilateral pulsating headache with nausea, photophobia, and a preceding visual aura is classic for migraine with aura.",
  },
  {
    category: "Psychiatry",
    stem: "A 45-year-old man reports two weeks of depressed mood, anhedonia, insomnia, poor concentration, and passive thoughts of death. He denies a specific plan. What is the most appropriate initial management?",
    choices: ["Immediate inpatient psychiatric hospitalization", "Start an SSRI and arrange close outpatient follow-up", "Electroconvulsive therapy", "Reassurance only, no treatment needed"],
    correctIndex: 1,
    explanation: "Without an active suicide plan or intent, a major depressive episode is managed with an SSRI and close outpatient follow-up rather than hospitalization.",
  },
  {
    category: "Obstetrics",
    stem: "A 29-year-old woman at 32 weeks gestation presents with severe headache, blood pressure of 165/110 mmHg, and 2+ proteinuria on urine dipstick. What is the most likely diagnosis?",
    choices: ["Gestational hypertension", "Chronic hypertension", "Preeclampsia", "Eclampsia"],
    correctIndex: 2,
    explanation: "New-onset hypertension after 20 weeks gestation with proteinuria defines preeclampsia. Eclampsia additionally requires seizures.",
  },
  {
    category: "Pediatrics",
    stem: "A 2-year-old presents with a barking cough, inspiratory stridor, and hoarseness that started after a few days of rhinorrhea. He is afebrile and comfortable at rest. What is the most likely diagnosis?",
    choices: ["Epiglottitis", "Bacterial tracheitis", "Croup", "Foreign body aspiration"],
    correctIndex: 2,
    explanation: "Croup (laryngotracheobronchitis) classically presents with a barking cough, stridor, and hoarseness following a viral prodrome, typically in children 6 months to 3 years.",
  },
  {
    category: "Hematology",
    stem: "A 55-year-old man presents with fatigue and easy bruising. CBC shows pancytopenia, and peripheral smear reveals numerous blasts with Auer rods. What is the most likely diagnosis?",
    choices: ["Chronic myeloid leukemia", "Acute myeloid leukemia", "Acute lymphoblastic leukemia", "Myelodysplastic syndrome"],
    correctIndex: 1,
    explanation: "Auer rods on peripheral smear are pathognomonic for acute myeloid leukemia.",
  },
  {
    category: "Rheumatology",
    stem: "A 34-year-old woman presents with a malar rash, joint pain, and fatigue. Labs show a positive ANA and anti-dsDNA antibody. What is the most likely diagnosis?",
    choices: ["Rheumatoid arthritis", "Systemic lupus erythematosus", "Sjogren syndrome", "Systemic sclerosis"],
    correctIndex: 1,
    explanation: "A malar rash with positive ANA and anti-dsDNA antibodies is characteristic of systemic lupus erythematosus.",
  },
  {
    category: "Dermatology",
    stem: "A 65-year-old man presents with a pigmented lesion on his back that has asymmetric borders, color variation, and has grown to 8 mm over the past few months. What is the most appropriate next step?",
    choices: ["Reassurance and routine follow-up", "Excisional biopsy", "Topical steroid cream", "Cryotherapy"],
    correctIndex: 1,
    explanation: "A lesion with ABCDE features (asymmetry, border irregularity, color variation, diameter >6mm, evolving) is concerning for melanoma and requires excisional biopsy for diagnosis.",
  },
];

async function main() {
  const count = await prisma.question.count();
  if (count > 0) {
    console.log(`Skipping seed: ${count} questions already exist.`);
    return;
  }

  await prisma.question.createMany({ data: questions });
  console.log(`Seeded ${questions.length} questions.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
