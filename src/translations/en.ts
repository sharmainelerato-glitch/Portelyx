const en = {
  common: {
    back: 'Back',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    signOut: 'Sign out',
    notSelected: 'Not selected',
    active: 'Active',
    continue: 'Continue',
    loading: 'Loading',
    close: 'Close',
    search: 'Search',
    language: 'Language',
    currency: 'Currency',
    country: 'Country',
  },

  nav: {
    enterPlatform: 'Enter platform',
    signIn: 'Sign in',
  },

  landing: {
  buildTwin: 'Build my Financial Twin',
  tryDemo: 'Try the demo',

  kicker: 'FINANCIAL DECISION TWIN',

  heroTitle: 'Rehearse your financial decisions before you live them.',
  heroDescription:
    'Explore possible futures, stress-test important choices, and discover what would need to change before your answer changes.',

  yourDecision: 'YOUR DECISION',
  decisionQuestion: 'What if I buy it?',

  now: 'NOW',
  buy: 'Buy',
  testResilience: 'Test resilience',

  alternative: 'ALTERNATIVE',
  wait: 'Wait',
  compareFuture: 'Compare the future',

  option: 'OPTION',
  finance: 'Finance',
  findBreakpoint: 'Find the breakpoint',

  calculatesFuture:
    'calculates which choice survives the most futures.',

  yourFinances: 'Your finances',
  possibleFutures: 'Your possible futures',
  yourDecisionFootnote: 'Your decision',

  setupTitle: 'Build your financial picture.',
  connectAccounts: 'Connect your accounts',
  addFinancesManually: 'Add finances manually',
  exploreDemoData: 'Explore with demo data',

  futureVisualLabel:
  'One financial decision branching into possible futures',

  setupLabel: 'SET UP PORTELYX',
setupDescription:
  "Choose how you'd like to get started. You can always add more later.",

connectAccountsDescription:
  'Securely import your financial information and keep your picture up to date.',

manualDescription:
  'Build your Financial Twin yourself and choose exactly what PORTELYX knows.',

demoDescription:
  'Experience PORTELYX with a ready-made financial profile before adding your own.',

financialControl:
  'Your financial information stays under your control.',

profile: 'Profile',
homeLabel: 'PORTELYX home',
},

  demo: {
    useMyData: 'Use my data',
  },
  
  connectAccounts: {
  back: 'Back',

  hubEyebrow: 'BUILD YOUR FINANCIAL TWIN',
  hubTitle: 'Bring your financial world into one twin.',
  hubDescription:
    'Connect supported accounts, upload a statement, or enter your finances manually. PORTELYX normalizes each route into the same Financial Twin.',

  accountData: 'ACCOUNT DATA',
  connectAccounts: 'Connect accounts',
  connectAccountsDescription:
    'Connect supported banks, brokerages and financial accounts through a provider-ready authorization flow.',
  connect: 'Connect',

  documentImport: 'DOCUMENT IMPORT',
  uploadStatement: 'Upload statement',
  uploadStatementDescription:
    'Import PDF or CSV statements and review extracted information before anything enters your Financial Twin.',
  upload: 'Upload',

  manualControl: 'MANUAL CONTROL',
  enterManually: 'Enter manually',
  enterManuallyDescription:
    'Build the twin yourself when you prefer not to connect or upload financial data.',
  start: 'Start',

  globalByDesign: 'GLOBAL BY DESIGN',
  globalDescription:
    'PORTELYX is not tied to one country, bank or provider. Financial sources are normalized into a currency-aware Financial Twin.',
  accountReviewEyebrow: 'CONNECTED ACCOUNT REVIEW',
accountReviewTitle: 'Review what PORTELYX received.',
accountReviewDescription:
  'These sandbox accounts were retrieved through the connected account provider and normalized before entering your Financial Twin.',

connected: 'CONNECTED',
accountsDetected: '{{count}} accounts detected',
provider: 'Provider',
currencies: 'Currencies',
notDetected: 'Not detected',

financialAccount: 'Financial account',
unknownType: 'Unknown type',

cash: 'Cash',
debt: 'Debt',
investments: 'Investments',

reviewBeforeBuilding: 'Review before building.',
currencySeparation:
  'Connected data stays separated by currency. PORTELYX will not silently add different currencies together.',

continueConnectedData: 'Continue with connected data',
statementEyebrow: 'STATEMENT IMPORT',
statementTitle: 'Upload. Review. Then build.',
statementDescription:
  'PORTELYX never silently treats extracted statement data as truth. You review the import before it becomes part of the Financial Twin.',

chooseStatement: 'Choose a bank or financial statement',
statementFileControl:
  'PDF or CSV · your file stays under your control',
remove: 'Remove',

reviewBeforeImport: 'Review before import',
reviewBeforeImportDescription:
  'Extracted balances and transactions must be confirmed before PORTELYX updates a Financial Twin.',

importReview: 'IMPORT REVIEW',
noStatementSelected: 'No statement selected.',
extractedInformation:
  'Your extracted information will appear here for review.',

fileReady: 'FILE READY',
fileSelected: '{{type}} selected successfully.',
fileReadyDescription:
  "Send this file to PORTELYX's statement parser. Nothing enters the Financial Twin until you review the detected rows.",

extracting: 'Extracting...',
extractStatement: 'Extract statement',

statementSupport:
  'CSV and text-based PDF statements are supported. Scanned image-only PDFs are deliberately rejected until an OCR adapter is added.',

readyForReview: 'READY FOR REVIEW',
transactionsDetected: '{{count}} transactions detected',

detectedIncome: 'Detected income',
detectedExpenses: 'Detected expenses',
detectedBalance: 'Detected balance',

reviewNotes: 'Review notes',
confidence: '{{level}} confidence',

amountFor: 'Amount for {{description}}',
directionFor: 'Direction for {{description}}',
categoryFor: 'Category for {{description}}',

income: 'Income',
expense: 'Expense',

reviewMandatory: 'Review is mandatory.',
reviewMandatoryDescription:
  'Correct any amount, direction or category that PORTELYX interpreted incorrectly before building the Financial Twin.',

continueReviewedData: 'Continue with reviewed data',

accountConnectionEyebrow: 'ACCOUNT CONNECTION',
accountConnectionTitle: 'Connect supported financial accounts.',
accountConnectionDescription:
  'Choose the type of financial source you want to bring into PORTELYX. The interface stays provider-neutral and global.',

providerReadyArchitecture: 'Provider-ready architecture',

accountSources: 'ACCOUNT SOURCES',
whatToConnect: 'What would you like to connect?',
connectedCount: '{{count}} connected',

searchAccountTypes: 'Search account types',

connectedStatus: 'Connected',
connectStatus: 'Connect',

providerSecurityNote:
  'PORTELYX never asks for a banking password directly. Production connections will be delegated to authorized account-data providers. This hackathon build currently demonstrates the authorization boundary with a sandbox connection.',

financialTwin: 'FINANCIAL TWIN',
twinBuildsAsYouConnect: 'Your picture builds as you connect.',

bankAndCash: 'Bank & cash',
debts: 'Debts',
goals: 'Goals',

twinBuilderDescription:
  'Connect what is available, upload statements for unsupported institutions, or add the rest manually.',

continueBuilding: 'Continue building',
sandboxConnection: 'SANDBOX CONNECTION',
connectProvider: 'Connect {{provider}}',
sandboxDescription:
  'This demonstrates the authorization boundary without collecting real financial credentials. A production aggregation provider can replace the adapter without changing the Financial Twin model.',

readFinancialData: 'Read financial data',
readFinancialDataDescription:
  'Balances and account information needed for your Financial Twin.',

noTradingPermission: 'No trading permission',
noTradingPermissionDescription:
  'PORTELYX simulates decisions. It does not move money or execute trades.',

connectingToSandbox: 'Connecting to sandbox...',
authorizeSandboxConnection: 'Authorize sandbox connection',

addLater: 'Add later',
},
  profile: {
    eyebrow: 'YOUR PORTELYX ACCOUNT',
    title: 'Profile',

    description:
      'Set the preferences PORTELYX should use when building and explaining your Financial Twin.',

    edit: 'Edit profile',
    saved: 'Profile saved',

    finishTitle:
      'Finish setting up your profile',

    finishDescription:
      'Choose your country, preferred currency and PORTELYX language so your experience can be personalised.',

    complete: 'Complete profile',

    identity: 'Identity',

    identityDescription:
      'Basic information associated with your PORTELYX experience.',

    displayName: 'Display name',

    displayNamePlaceholder:
      'How should PORTELYX address you?',

    email: 'Email',

    emailManaged:
      'Managed by your secure PORTELYX sign-in.',

    regionCurrency:
      'Region & currency',

    regionCurrencyDescription:
      'Tell PORTELYX which financial context it should use for your experience.',

    countryRegion:
      'Country / region',

    selectCountry:
      'Select your country / region',

    countryHelp:
      'Selecting a country suggests a currency. You can change the currency separately.',

    preferredCurrency:
      'Preferred currency',

    selectCurrency:
      'Select your preferred currency',

    currencyHelp:
      'This is a display preference. Changing it does not recalculate an existing Financial Twin.',

    languageSection:
      'Language',

    languageDescription:
      'Choose how you want PORTELYX to communicate with you.',

    portelyxLanguage:
      'PORTELYX language',

    searchLanguage:
      'Search language or region...',

    selectLanguage:
      'Select your language',

    noLanguage:
      'No matching language found yet.',

    languageHelp:
      'PORTELYX uses this preference for supported interface text and explanations.',

    saveChanges:
      'Save changes',

    account:
      'PORTELYX account',

    signedInAs:
      'Signed in as',

    languageNote:
      'PORTELYX is designed for multilingual use. Translation quality may vary by language while translations are reviewed and improved.',
  },


  settings: {
    back: 'Back',
    profile: 'Profile',
    eyebrow: 'YOUR PORTELYX',
    title: 'Settings',
    description:
      'Control how PORTELYX behaves, explains decisions, remembers your activity and handles your data.',
    saved: 'Settings saved.',

    experience: 'Experience',
    experienceDescription: 'Choose how PORTELYX looks and communicates.',
    appearance: 'Appearance',
    appearanceDescription:
      'PORTELYX currently uses its dark financial workspace.',
    dark: 'Dark',
    useDeviceSetting: 'Use device setting',
    aiExplanations: 'AI explanations',
    aiExplanationsDescription:
      'Allow PORTELYX AI to explain calculated outcomes in plain language.',
    conciseExplanations: 'Concise explanations',
    conciseExplanationsDescription:
      'Prefer shorter answers when PORTELYX explains your financial simulations.',
    decisionWarnings: 'Decision warnings',
    decisionWarningsDescription:
      'Highlight fragile choices, cash shortfalls and important financial breakpoints.',

    privacyData: 'Privacy & data',
    privacyDataDescription: 'Decide what PORTELYX is allowed to remember.',
    rememberDecisions: 'Remember my decisions',
    rememberDecisionsDescription:
      'Allow your Decision Twin to retain decision history for future comparisons and replay.',
    optionalAnalytics: 'Optional product analytics',
    optionalAnalyticsDescription:
      'Allow privacy-conscious usage analytics that can help improve PORTELYX. Off by default.',
    financialData: 'Financial data',
    financialDataDescription:
      'Financial information should only be used to provide PORTELYX features and your Financial Decision Twin.',
    private: 'Private',

    connections: 'Connections',
    connectionsDescription:
      'Manage services connected to your Financial Twin.',
    financialAccounts: 'Financial accounts',
    financialAccountsDescription:
      'Connected financial providers are managed from the PORTELYX financial setup flow.',
    manageInSetup: 'Manage in setup',
    alexaDescription:
      'Alexa+ integration will appear here when account linking is available for this PORTELYX account.',
    pendingAccess: 'Pending access',

    security: 'Security',
    securityDescription:
      'Your PORTELYX identity is protected by Amazon Cognito.',
    signedInAccount: 'Signed-in account',
    active: 'Active',
    signOut: 'Sign out',

    legalSupport: 'Legal & support',
    legalSupportDescription:
      'Understand how PORTELYX works and how your information is handled.',
    privacyPolicy: 'Privacy Policy',
    privacyPolicyDescription:
      'How PORTELYX handles information and privacy.',
    termsOfUse: 'Terms of Use',
    termsOfUseDescription:
      'Rules and conditions for using PORTELYX.',
    financialDisclaimer: 'Financial Disclaimer',
    financialDisclaimerDescription:
      'Understand the limits of simulations and financial decision support.',
    contactSupport: 'Contact & Support',
    contactSupportDescription:
      'Get help or contact the PORTELYX team.',

    accountManagement: 'Account management',
    accountManagementDescription:
      'Controls affecting your PORTELYX account.',
    deleteAccountTitle: 'Delete PORTELYX account',
    deleteAccountDescription:
      "Permanent account deletion will be available once PORTELYX server-side user data storage is connected. We won't show a fake delete button before the full deletion workflow exists.",
    deleteAccount: 'Delete account',
    saveSettings: 'Save settings',
  },

  decisionTwin: {
    defaultQuestion: 'Can I afford this purchase?',
    buyNow: 'Buy now',
    waitMonthsLabel: 'Wait {{count}} month(s)',
    financeMonthsLabel: 'Finance over {{count}} months',
    errorDescribeDecision: 'Describe the decision you want PORTELYX to remember.',
    errorPurchasePrice: 'Enter a purchase price above zero.',
    errorHorizon: 'Horizon must be at least 1 month.',
    errorWait: 'Wait period must be at least 1 month.',
    errorFinanceTerm: 'Finance term must be at least 1 month.',
    errorInterestRate: 'Interest rate cannot be negative.',
    errorRun: 'PORTELYX could not run this decision.',
    errorInspect: 'PORTELYX could not inspect this decision.',
    errorRemember: 'PORTELYX could not remember this decision.',

    eyebrow: 'DECISION TWIN',
    title: 'Rehearse the decision before you live it.',
    description:
      'Fork one choice into alternate futures, stress-test each path and find what would have to change before the answer changes.',
    principle: 'AI understands. PORTELYX calculates.',
    ask: 'ASK',
    loopAsk: 'ASK',
    loopFork: 'FORK',
    loopStress: 'STRESS',
    loopScore: 'SCORE',
    loopBreakpoint: 'BREAKPOINT',
    loopPathToYes: 'PATH TO YES',
    loopDecide: 'DECIDE',

    questionTitle: 'What decision are you considering?',
    engineNote:
      "The calculations below come from PORTELYX's deterministic Decision Twin engines.",
    decision: 'Decision',
    decisionPlaceholder: 'Can I afford a R15,000 laptop?',
    purchasePrice: 'Purchase price · {{currency}}',
    decisionHorizon: 'Decision horizon · months',
    waitAlternative: 'Wait alternative · months',
    financeTerm: 'Finance term · months',
    financeDeposit: 'Finance deposit · {{currency}}',
    annualInterest: 'Annual interest · %',
    pathToYesTarget: 'Path to Yes target · /100',
    rehearsing: 'Rehearsing futures…',
    forkDecision: 'Fork this decision',
    couldNotComplete: 'Decision Twin could not complete this step.',
    deterministicNote:
      'Nothing here is a forecast or probability. PORTELYX compares deterministic futures using the Financial Twin currently loaded in this workspace.',
    forkStressScore: 'FORK + STRESS + SCORE',
    threeFutures: 'Three futures. One decision.',
    recommendedByResilience: 'Recommended by resilience:',
    mostResilient: 'Most resilient',
    decisionResilience: 'DECISION RESILIENCE',
    stressTestsSurvived: '{{passed}}/{{total}} stress tests survived',
    endingCash: 'Ending cash',
    lowestCash: 'Lowest cash',
    weakestStress: 'Weakest stress',
    purchaseFunded: 'Purchase funded',
    yes: 'Yes',
    no: 'No',
    financePayment: 'Finance payment',
    perMonth: '/mo',
    totalDecisionCost: 'Total decision cost {{amount}}',
    findingBoundaries: 'Finding boundaries…',
    inspectFuture: 'Inspect this future',
    scoreMethod:
      'Score method: 60% scenario survival + 40% liquidity-buffer preservation. It is a product resilience signal, not a probability or credit score.',
    breakpointPathToYes: 'BREAKPOINT + PATH TO YES',
    currentResilience: 'Current resilience',
    searchingBoundary: 'Searching the decision boundary…',
    emergencyExpense: 'Emergency expense · {{currency}}',
    incomeReduction: 'Income reduction · %',
    expenseIncrease: 'Expense increase · %',
    survivesSearchRange: 'Survives search range',
    noFailureBoundary: 'No failure boundary found in the configured range.',
    survivedToFailed: 'Largest survived → first failed',
    pathToYes: 'PATH TO YES',
    alreadyReaches: 'This path already reaches {{score}}/100.',
    whatGetsTo: 'What gets this path to {{score}}/100?',
    noPath:
      "No additional change is required, or no verified path was found in the engine's configured search space.",
    decide: 'DECIDE',
    chooseAndRemember: 'Choose this future and let PORTELYX remember it.',
    decisionMemoryDescription:
      'Saving creates Decision Memory so Reality Check and Regret Replay can compare the decision with what actually happens later.',
    remembering: 'Remembering…',
    chooseOption: 'Choose {{option}}',
    remembered: 'Decision remembered.',
    rememberedDescription:
      'PORTELYX can use this record later for Reality Check, Regret Replay and Adaptive Twin learning.',
    inspectPrompt:
      'Select “Inspect this future” to calculate its real breakpoints and Path to Yes.',
    footerTitle: 'PORTELYX Decision Twin',
    footerNote:
      'Deterministic decision rehearsal. Stress scenarios are what-if assumptions, not forecasts.',
    depositError: 'Deposit must be between zero and the purchase price.',
    targetError: 'Target resilience must be between 0 and 100.',
  },


  statementSetup: {
    back: 'Back',
    eyebrow: 'STATEMENT SETUP',
    title: 'Confirm what this statement represents.',
    description: 'PORTELYX will not treat statement totals as monthly values until you confirm the period and base currency.',
    reviewedTransactions: '{{count}} reviewed transactions',
    baseCurrency: 'Base currency',
    currencyPlaceholder: 'Search currency, e.g. USD or Dollar',
    statementPeriod: 'Statement period',
    monthsRepresented: 'months represented by this file',
    periodNote: 'Use 1 for one month, 3 for a quarterly statement, 6 for six months, and so on. PORTELYX divides reviewed totals by this period only after you confirm it.',
    previewEyebrow: 'NORMALIZED PREVIEW',
    previewTitle: 'What will enter setup.',
    monthlyIncome: 'Monthly income',
    monthlyExpenses: 'Monthly expenses',
    availableCash: 'Available cash',
    notDetected: 'Not detected',
    nothingFinal: 'Nothing is final yet.',
    prefillNote: 'After confirmation, these values prefill Financial Twin setup. You can still add or correct assets, debts, investments and goals before building the Twin.',
    continueToTwin: 'Continue to Financial Twin setup',
  },

  workspace: {
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    twinActive: 'Twin active',
    demoFinancialTwin: 'Demo Financial Twin',
    useMyData: 'Use my data',
    exit: 'Exit',
    workspace: 'WORKSPACE',
    overview: 'Overview',
    decisionTwin: 'Decision Twin',
    investments: 'Investments',
    goals: 'Goals',
    scenarios: 'Scenarios',
    risk: 'Risk',
    reports: 'Reports',
    dataSources: 'Data Sources',
    workspaceMap: 'WORKSPACE MAP',
    workspaceMapDescription:
      'Decision Twin rehearses choices before you make them. Scenario Lab remains available for broader what-if testing.',

    overviewEyebrow: 'FINANCIAL DIGITAL TWIN',
    overviewTitle: 'Your financial picture.',
    overviewDescription:
      'A focused view of the financial state PORTELYX uses for analysis.',
    financialTwinOptions: 'Financial twin options',

    estimatedNetWorth: 'ESTIMATED NET WORTH',
    assetsMinusDebts: 'Assets minus debts',
    monthlySurplus: 'MONTHLY SURPLUS',
    incomeMinusSpending: 'Income minus spending',
    availableCash: 'AVAILABLE CASH',
    currentTwin: 'Current twin',
    cashRunway: 'CASH RUNWAY',
    monthsShort: '{{count}} mo',
    atCurrentSpending: 'At current spending',

    monthlyFlow: 'MONTHLY FLOW',
    incomeAndSpending: 'Income and spending',
    cashFlowOptions: 'Cash flow options',
    cashFlowComparison: 'Monthly cash flow comparison',
    income: 'Income',
    spending: 'Spending',
    surplus: 'Surplus',
    deficit: 'Deficit',

    balanceSheet: 'BALANCE SHEET',
    assetsAndDebt: 'Assets and debt',
    balanceSheetOptions: 'Balance sheet options',
    debtAssets: 'debt / assets',
    assets: 'Assets',
    debts: 'Debts',

    twinCoverage: 'FINANCIAL TWIN COVERAGE',
    whatPortelyxKnows: 'What PORTELYX knows',
    twinCoverageOptions: 'Twin coverage options',
    baseCurrency: 'Base currency',
    runwayMonths: 'Runway months',

    investmentsEyebrow: 'INVESTMENT LAYER',
    investmentsTitle: 'Your invested capital.',
    investmentsDescription:
      'Assets currently represented inside your Financial Twin.',
    investmentOptions: 'Investment options',
    noInvestments: 'No investments added yet.',
    noInvestmentsDescription:
      'Add investments when you want PORTELYX to include them in your Financial Twin.',
    asset: 'Asset',
    type: 'Type',
    quantity: 'Quantity',
    currentPrice: 'Current price',
    value: 'Value',
    currency: 'Currency',
    portfolioValue: 'Portfolio value',
    positions: '{{count}} positions',

    goalsEyebrow: 'GOAL LAYER',
    goalsTitle: 'What your money is working toward.',
    goalsDescription:
      'Track the financial targets PORTELYX should protect and test across future decisions.',
    goalOptions: 'Goal options',
    noGoals: 'No goals added yet.',
    noGoalsDescription:
      'Add a goal when you want PORTELYX to measure decisions against a specific financial target.',
    target: 'Target',
    saved: 'Saved',
    progress: 'Progress',
    monthlyContribution: 'Monthly contribution',
    targetDate: 'Target date',
    goalProgress: '{{progress}}% funded',
    notSet: 'Not set',
    goalIntelligence: 'GOAL INTELLIGENCE',
    estimatedCompletion: 'ESTIMATED COMPLETION',
    paceAdjustment: 'PACE ADJUSTMENT',
    notReachableAtCurrentPace: 'Not reachable at current pace',
    notAvailable: 'Not available',
    noIncreaseNeeded: 'No increase needed',

    scenariosEyebrow: 'SCENARIO LAB',
    scenariosTitle: 'Stress-test the future.',
    scenariosDescription:
      'Explore broader what-if events and see how your Financial Twin responds.',
    scenarioOptions: 'Scenario options',
    riskEyebrow: 'RISK LAYER',
    riskTitle: 'Where your twin is exposed.',
    riskDescription:
      'Signals that help explain where your current financial position may be vulnerable.',
    riskOptions: 'Risk options',

    reportsEyebrow: 'FINANCIAL TWIN CASE FILE',
    reportsTitle: 'A record of what PORTELYX knows.',
    reportsDescription:
      'Current twin state, measured risk signals and completed scenario evidence in one reviewable report.',
    currentSnapshot: 'Current snapshot',
    downloadPdf: 'Download PDF',
    caseFile: 'PORTELYX / CASE FILE',
    financialTwinSnapshot: 'Financial Twin Snapshot',
    reportDisclaimer:
      'This report reflects the Financial Twin currently loaded in this workspace. It does not alter the twin and is not financial advice.',
    financialPosition: 'Financial position',
    currentBaseTwin: 'Current state of the base twin',
    estimatedNetWorthReport: 'Estimated net worth',
    monthlyIncome: 'Monthly income',
    monthlySpending: 'Monthly spending',

    dataSourcesEyebrow: 'DATA SOURCES',
    dataSourcesTitle: 'What feeds your Financial Twin.',
    dataSourcesDescription:
      'Review the financial information currently represented in this workspace.',

    scenarioTitle: 'Test a different future.',
    scenarioSafe: 'Base Twin stays unchanged',
    askToSimulate: 'ASK PORTELYX TO SIMULATE',
    describeChange: 'Describe the change you want to test.',
    run: 'Run',
    running: 'Running…',
    incomeInterruption: 'INCOME INTERRUPTION',
    incomeStops: 'What if income stops?',
    live: 'LIVE',
    monthsWithoutIncome: 'Months without income',
    simulate: 'Simulate',
    simulating: 'Simulating…',
    howItWorks: 'HOW IT WORKS',
    branchNotRewrite: 'A branch, not a rewrite.',
    baseTwin: 'Base Twin',
    scenarioTwin: 'Scenario Twin',
    calculated: 'Calculated',
    waiting: 'Waiting',
    scenarioImpact: 'SCENARIO IMPACT',
    fundingGap: 'Funding gap',
    cashCoversPeriod: 'Cash covers period',
    cashAfterPeriod: 'Cash after period',
    expensesDuringPeriod: 'Expenses during period',
    lostIncome: 'Lost income',
    cashCoverage: 'Cash coverage',
    scenarioDuration: 'Scenario duration',
    unchanged: 'Unchanged',

    askPortelyxAI: 'Ask PORTELYX AI',
    portelyxAI: 'PORTELYX AI',
    aiCompanion: 'Financial Twin companion',
    askAboutTwin: 'ASK ABOUT THIS TWIN',
    you: 'YOU',
    thinking: 'Thinking…',
    ask: 'Ask',
    aiWorking: 'Working with your Financial Twin…',
    aiUnable: 'Unable to complete that request.',
    deterministicEngine: 'DETERMINISTIC ENGINE',
    decisionTwinVerified: 'Decision Twin verified',
    notSupplied: 'Not supplied',
    notEnoughData: 'Not enough data',
    riskLow: 'Low',
    riskModerate: 'Moderate',
    riskHigh: 'High',
    needsMoreData: 'Needs more data',
    needsData: 'Needs data',
    measuredRiskValue: '{{level}} measured risk',
    riskValue: '{{level}} risk',
    investmentCoverageValue: '{{value}} represented across tracked holdings.',
    noInvestmentHoldingsRepresented: 'No investment holdings are currently represented.',
    goalsOffPaceCount: '{{count}} currently flagged as potentially off pace.',
    noFinancialGoalsRepresented: 'No financial goals are currently represented.',
    monthsWithoutIncomeValue: '{{count}} months without income',
    monthsValue: '{{count}} months',
    monthsShortValue: '{{count}} mo',
    openScenarioLab: 'Open Scenario Lab',
    caseFileTitle: 'Financial Twin Case File',
    financialPositionDescription: 'Current state of the base Financial Twin.',
    riskFindings: 'Risk findings',
    liquidity: 'Liquidity',
    expensesNeeded: 'Expenses needed',
    cashFlow: 'Cash flow',
    incomeNeeded: 'Income needed',
    debtExposure: 'Debt exposure',
    concentration: 'Concentration',
    noTrackedPortfolioValue: 'No tracked portfolio value',
    dataProvenance: 'Data provenance',
    financialProvider: 'Financial provider',
    connectedAccount: 'Connected account',
    scenarioEvidence: 'Scenario evidence',
    scenarioEvidenceDescription: 'Most recent deterministic income-interruption test.',
    test: 'Test',
    startingCash: 'Starting cash',
    caseFileDescription: 'A snapshot of the current Financial Twin, measured resilience signals, tracked objectives, investments and scenario evidence.',
    riskDisclaimer: 'PORTELYX resilience signals are heuristic indicators derived from the current twin. They are not a credit score or investment recommendation.',
    surplusMarginValue: '{{value}}% surplus margin',
    trackedDebtValue: '{{value}} tracked debt',
    noScenarioEvidenceReport: 'No scenario evidence was present in this session when the report was generated.',
    dataProvenanceDescription: 'Source evidence retained for connected financial data represented in this Financial Twin.',
    sandboxDataWarning: 'SANDBOX DATA — testing and demonstration values, not live banking data.',
    noConnectedProvenance: 'No connected-account provenance is attached to this Financial Twin.',
    unknown: 'unknown',
    providerAccount: 'provider account',
    account: 'account',
    balanceSourceValue: 'balance source: {{value}}',
    goalIntelligenceUnavailable: 'Goal Intelligence is unavailable.',
  },

  manualSetup: {
  exitSetup: 'Exit setup',
  buildYourTwin: 'BUILD YOUR FINANCIAL TWIN',
  mainTitle: 'One clear picture of your money.',
  setupProgress: 'Setup progress',

  basics: 'Basics',
  investments: 'Investments',
  goals: 'Goals',
  review: 'Review',

  foundationEyebrow: 'YOUR FOUNDATION',
  foundationTitle: 'Start with your money.',
  foundationDescription:
    'Just enough to establish the foundation. You can refine your Financial Twin later.',

  baseCurrency: 'Base currency',
  searchCurrency: 'Search currency',
  monthlyIncome: 'Monthly income',
  monthlySpending: 'Monthly spending',
  moreAboutFinances: 'More about your finances',
  availableCash: 'Available cash',
  totalAssets: 'Total assets',
  totalDebts: 'Total debts',

  investmentsEyebrow: 'INVESTMENTS',
  investmentsTitle: 'Where is your money invested?',
  investmentsDescription:
    'Add only what you want PORTELYX to model. This step is optional.',
  addInvestment: 'Add an investment',
  investmentTypes: 'Stocks, ETFs, funds, crypto and more',
  investmentNumber: 'INVESTMENT {{number}}',
  newInvestment: 'New investment',
  remove: 'Remove',
  assetName: 'Asset name',
  assetNamePlaceholder: 'e.g. Company or fund',
  symbol: 'Symbol',
  optional: 'Optional',
  assetType: 'Asset type',
  assetTypePlaceholder: 'e.g. Stock or ETF',
  quantity: 'Quantity',
  currentPrice: 'Current price',
  currency: 'Currency',
  addAnotherInvestment: 'Add another investment',

  goalsEyebrow: 'GOALS',
  goalsTitle: 'What are you building toward?',
  goalsDescription:
    'Give PORTELYX something meaningful to protect, test and plan around.',

  financialGoals: 'FINANCIAL GOALS',
  goalBuilderTitle: 'What are you building toward?',
  goalBuilderDescription:
    'Add any financial target. PORTELYX uses the details you provide to calculate the path, test scenarios, and show what changes.',
  addGoal: 'Add goal',
  addFirstGoal: 'Add your first goal',
  goalExamples:
    'A business, home, tuition, travel, emergency fund, retirement plan — or anything else with a financial target.',
  goalLabel: 'GOAL',
  untitledGoal: 'Untitled goal',
  goalQuestion: 'What are you working toward?',
  goalNamePlaceholder: 'e.g. Start my business',
  targetAmount: 'Target amount',
  targetDate: 'Target date',
  alreadySaved: 'Already saved',
  monthlyContribution: 'Monthly contribution',
  addOptionalDetails: 'Add optional details',
  category: 'Category',
  custom: 'custom',
  priority: 'Priority',
  notes: 'Notes',
  notesPlaceholder: 'Anything PORTELYX should know',
  funded: '{{progress}}% funded',
  addTargetForProgress: 'Add a target to see progress',
  targetDateDisplay: 'Target {{date}}',
  addAnotherGoal: 'Add another goal',
  goalProjectionNote:
    'PORTELYX does not assume an investment return here. Goal projections use the amounts and contributions you provide unless a separate scenario explicitly introduces another assumption.',

  reviewEyebrow: 'YOUR FINANCIAL TWIN',
  reviewTitle: 'Ready to come to life.',
  reviewDescription:
    'Review the foundation PORTELYX will use for simulations.',
  monthlySurplus: 'MONTHLY SURPLUS',
  incomeMinusSpending: 'Income minus monthly spending',
  financialFoundation: 'Financial foundation',
  ready: 'Ready',
  needsCurrency: 'Needs currency',
  added: '{{count}} added',
  skipped: 'Skipped',

  setupOptions: 'Setup options',
  skipForNow: 'Skip for now',
  buildingFinancialTwin: 'Building Financial Twin...',
  buildMyFinancialTwin: 'Build my Financial Twin',
},
}

export default en