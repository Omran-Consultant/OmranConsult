<?php

/**
 * Demo project content (docs/briefs/DEMO_PROJECTS.md). Written from each project's title, client,
 * sector and the company's service vocabulary. A project that receives any of it gets `projects.has_demo_content`.
 * Gallery keys are site photos without people; each list excludes that project's cover.
 *
 * @return array<string, array{
 *     overview: array{ar: list<string>, en: list<string>},
 *     scope: array{ar: list<string>, en: list<string>},
 *     service_type: array{ar: string, en: string},
 *     location: array{ar: string, en: string}|null,
 *     regions: list<string>,
 *     gallery: list<string>
 * }>
 */
return [
    'mewa-operation-and-maintenance-efficiency-consulting' => [
        'overview' => [
            'ar' => [
                'يقدّم هذا المشروع خدمات استشارية لرفع كفاءة عمليات التشغيل والصيانة في مرافق وزارة البيئة والمياه والزراعة، بدءًا من حصر الأصول وتوثيقها وتقييم حالتها الفنية، وصولًا إلى صورة واضحة عن الوضع الراهن وأولويات التحسين في كل مرفق.',
                'ويركز العمل على تطوير خطط الصيانة الوقائية والتصحيحية، ومراجعة عقود التشغيل وآليات متابعة أدائها، وتنظيم بيانات الأصول في نظام موحّد يدعم اتخاذ القرار، مع نقل المعرفة إلى الفرق التشغيلية لضمان استمرارية التحسين.',
            ],
            'en' => [
                'This project provides consulting services to improve operation and maintenance efficiency across the facilities of the Ministry of Environment, Water and Agriculture, starting with asset inventory, documentation and technical condition assessment to build a clear picture of the current state and the improvement priorities at each facility.',
                'The work focuses on developing preventive and corrective maintenance plans, reviewing operating contracts and how their performance is monitored, and organizing asset data in one system that supports decision-making, while transferring knowledge to operating teams so improvement continues.',
            ],
        ],
        'scope' => [
            'ar' => ['حصر الأصول وتوثيقها وتصنيفها', 'تقييم الحالة الفنية للمرافق', 'تطوير خطط الصيانة الوقائية والتصحيحية', 'مراجعة عقود التشغيل والصيانة ومتابعة الأداء', 'تطبيق نظام CAFM وتنظيم بيانات الأصول', 'تأهيل الفرق التشغيلية ونقل المعرفة'],
            'en' => ['Asset inventory, documentation and classification', 'Technical condition assessment of facilities', 'Developing preventive and corrective maintenance plans', 'Reviewing operation and maintenance contracts and monitoring performance', 'Implementing a CAFM system and organizing asset data', 'Training operating teams and transferring knowledge'],
        ],
        'service_type' => ['ar' => 'استشارات', 'en' => 'Consulting'],
        'location' => null,
        'regions' => [],
        'gallery' => ['wave', 'aerial', 'sunset'],
    ],

    'dams-operation-and-maintenance-efficiency-consulting' => [
        'overview' => [
            'ar' => [
                'يعنى هذا المشروع بتقديم خدمات استشارية لرفع كفاءة عمليات التشغيل والصيانة للسدود، من خلال دراسة منظومة التشغيل القائمة وتوثيق المنشآت والمعدات المرتبطة بها وتقييم حالتها الفنية وفق متطلبات السلامة والاستدامة.',
                'ويشمل العمل إعداد خطط صيانة وقائية وتصحيحية تراعي طبيعة منشآت السدود، وتحديد متطلبات المتابعة الدورية وإدارة المخاطر، ووضع إجراءات تشغيل واضحة تساعد الجهات المشغلة على ضبط الأعمال الميدانية وتوحيد آليات إعداد التقارير.',
            ],
            'en' => [
                'This project provides consulting services to improve the operation and maintenance efficiency of dams, by studying the existing operating arrangements, documenting the structures and related equipment, and assessing their technical condition against safety and sustainability requirements.',
                'The work includes preparing preventive and corrective maintenance plans suited to dam structures, defining periodic monitoring and risk management requirements, and setting clear operating procedures that help operators control field work and standardize reporting.',
            ],
        ],
        'scope' => [
            'ar' => ['دراسة منظومة التشغيل والصيانة القائمة', 'توثيق المنشآت والمعدات وتقييم حالتها الفنية', 'إعداد خطط الصيانة الوقائية والتصحيحية', 'تحديد متطلبات المتابعة الدورية وإدارة المخاطر', 'وضع إجراءات التشغيل وآليات إعداد التقارير'],
            'en' => ['Studying the existing operation and maintenance arrangements', 'Documenting structures and equipment and assessing their technical condition', 'Preparing preventive and corrective maintenance plans', 'Defining periodic monitoring and risk management requirements', 'Setting operating procedures and reporting mechanisms'],
        ],
        'service_type' => ['ar' => 'استشارات', 'en' => 'Consulting'],
        'location' => null,
        'regions' => [],
        'gallery' => ['aerial', 'wave'],
    ],

    'mewa-small-projects-supervision-phase-one' => [
        'overview' => [
            'ar' => [
                'يتناول هذا المشروع الإشراف على المشاريع الصغيرة في مرحلتها الأولى بوزارة البيئة والمياه والزراعة، بما يشمل متابعة أعمال التنفيذ في المواقع والتحقق من مطابقتها للمخططات والمواصفات المعتمدة وشروط العقود.',
                'ويعتمد الإشراف على ضبط الجودة وتطبيق متطلبات الصحة والسلامة والبيئة، ومراجعة البرامج الزمنية ومستخلصات الأعمال، ورفع تقارير دورية للجهة المالكة، بما يوفر صورة موحدة عن سير العمل عبر المشاريع المتعددة.',
            ],
            'en' => [
                'This project covers the supervision of small projects in their first phase at the Ministry of Environment, Water and Agriculture, including following up on site execution and verifying that it conforms to the approved drawings, specifications and contract terms.',
                'Supervision relies on quality control and applying health, safety and environment requirements, reviewing schedules and payment applications, and submitting periodic reports to the owner, giving one consistent view of progress across multiple projects.',
            ],
        ],
        'scope' => [
            'ar' => ['متابعة أعمال التنفيذ في المواقع', 'التحقق من المطابقة للمخططات والمواصفات', 'ضمان ومراقبة الجودة', 'تطبيق متطلبات الصحة والسلامة والبيئة', 'مراجعة البرامج الزمنية ومستخلصات الأعمال', 'إعداد التقارير الدورية للجهة المالكة'],
            'en' => ['Following up on site execution', 'Verifying conformity with drawings and specifications', 'Quality assurance and control', 'Applying health, safety and environment requirements', 'Reviewing schedules and payment applications', 'Preparing periodic reports for the owner'],
        ],
        'service_type' => ['ar' => 'إشراف', 'en' => 'Supervision'],
        'location' => null,
        'regions' => [],
        'gallery' => ['sunset', 'aerial', 'wave'],
    ],

    'water-conservation-solutions-mosques-and-schools-study' => [
        'overview' => [
            'ar' => [
                'تتناول هذه الدراسة تطبيق الحلول الترشيدية لاستهلاك المياه على عينة من المساجد والمدارس عبر مرحلتيها، من خلال فحص أنماط الاستهلاك وحالة التجهيزات والشبكات الداخلية في المباني المختارة وتحديد فرص الترشيد الملائمة لكل نوع من المنشآت.',
                'وتشمل الدراسة مقارنة الحلول المتاحة من الناحية الفنية وقابليتها للتطبيق، واقتراح أساليب تركيبها ومتابعتها، وصياغة توصيات تساعد الجهات المعنية على التوسع في تطبيق الحلول الترشيدية وفق معايير الكفاءة المعتمدة.',
            ],
            'en' => [
                'This study covers applying water-conservation solutions to a sample of mosques and schools across its two phases, by examining consumption patterns and the condition of fixtures and internal networks in the selected buildings and identifying the conservation opportunities suited to each type of facility.',
                'The study compares the available solutions technically and in terms of practicality, proposes how they should be installed and monitored, and formulates recommendations that help the relevant entities extend the solutions in line with approved efficiency standards.',
            ],
        ],
        'scope' => [
            'ar' => ['تحديد عينة المساجد والمدارس ومعايير اختيارها', 'فحص أنماط استهلاك المياه وحالة التجهيزات', 'مقارنة الحلول الترشيدية فنيًا', 'اقتراح أساليب التركيب والمتابعة', 'صياغة التوصيات وخطة التوسع في التطبيق'],
            'en' => ['Defining the sample of mosques and schools and its selection criteria', 'Examining water consumption patterns and fixture condition', 'Comparing conservation solutions technically', 'Proposing installation and monitoring methods', 'Formulating recommendations and a rollout plan'],
        ],
        'service_type' => ['ar' => 'دراسات', 'en' => 'Studies'],
        'location' => null,
        'regions' => [],
        'gallery' => ['aerial', 'sunset'],
    ],

    'cop16-technical-audit' => [
        'overview' => [
            'ar' => [
                'يتمثل هذا المشروع في التدقيق الفني على تنفيذ مشروع مؤتمر الأطراف لمكافحة التصحر COP16، من خلال مراجعة الوثائق الفنية والمخططات والمواصفات، ومقارنتها بما جرى تنفيذه في الموقع وفق متطلبات الجهة المالكة.',
                'ويركز التدقيق على التحقق من مطابقة الأعمال لمعايير الجودة والسلامة، ورصد الملاحظات الفنية وتصنيفها بحسب أولويتها، وتقديم تقارير واضحة تتضمن الإجراءات التصحيحية المقترحة، بما يدعم الجهة المالكة في متابعة أعمال المقاولين واستكمالها.',
            ],
            'en' => [
                'This project is a technical audit of the delivery of the COP16 Conference of the Parties to Combat Desertification project, reviewing technical documents, drawings and specifications and comparing them with what was built on site against the owner\'s requirements.',
                'The audit focuses on verifying that the works conform to quality and safety standards, recording technical observations and classifying them by priority, and providing clear reports with proposed corrective actions, supporting the owner in following up on and completing contractors\' works.',
            ],
        ],
        'scope' => [
            'ar' => ['مراجعة الوثائق الفنية والمخططات والمواصفات', 'التدقيق الميداني على الأعمال المنفذة', 'التحقق من متطلبات الجودة والسلامة', 'رصد الملاحظات الفنية وتصنيفها', 'إعداد تقارير التدقيق والإجراءات التصحيحية'],
            'en' => ['Reviewing technical documents, drawings and specifications', 'Field auditing of executed works', 'Verifying quality and safety requirements', 'Recording and classifying technical observations', 'Preparing audit reports and corrective actions'],
        ],
        'service_type' => ['ar' => 'تدقيق فني', 'en' => 'Technical audit'],
        'location' => null,
        'regions' => [],
        'gallery' => ['aerial', 'sunset', 'night'],
    ],

    'central-veterinary-laboratory-dhurma' => [
        'overview' => [
            'ar' => [
                'يشمل هذا المشروع التصميم والإشراف على إنشاء المختبر البيطري المركزي في ضرما لصالح وزارة البيئة والمياه والزراعة، بدءًا من إعداد التصاميم المعمارية والإنشائية والكهروميكانيكية بما يلائم طبيعة المنشآت المخبرية ومتطلبات تشغيلها.',
                'وتمتد الخدمات إلى الإشراف على أعمال الإنشاء في الموقع، والتحقق من مطابقتها للمواصفات ومتطلبات السلامة والضوابط المخبرية، وإدارة التنسيق بين التخصصات الهندسية المختلفة، وصولًا إلى مراجعة متطلبات التسليم للجهة المالكة.',
            ],
            'en' => [
                'This project covers the design and construction supervision of the Central Veterinary Laboratory in Dhurma for the Ministry of Environment, Water and Agriculture, beginning with architectural, structural and electromechanical designs suited to laboratory facilities and their operating requirements.',
                'Services extend to supervising construction on site, verifying conformity with specifications, safety requirements and laboratory controls, and managing coordination across the engineering disciplines, through to reviewing handover requirements with the owner.',
            ],
        ],
        'scope' => [
            'ar' => ['إعداد التصاميم المعمارية والإنشائية', 'تصميم الأنظمة الكهروميكانيكية للمنشآت المخبرية', 'التنسيق بين التخصصات الهندسية', 'الإشراف على أعمال الإنشاء في الموقع', 'التحقق من متطلبات السلامة والضوابط المخبرية', 'مراجعة متطلبات التسليم'],
            'en' => ['Preparing architectural and structural designs', 'Designing electromechanical systems for laboratory facilities', 'Coordinating across engineering disciplines', 'Supervising construction on site', 'Verifying safety requirements and laboratory controls', 'Reviewing handover requirements'],
        ],
        'service_type' => ['ar' => 'تصميم وإشراف', 'en' => 'Design and supervision'],
        'location' => ['ar' => 'ضرما، الرياض', 'en' => 'Dhurma, Riyadh'],
        'regions' => ['riyadh'],
        'gallery' => ['truss', 'building', 'aerial'],
    ],

    'efficiency-and-conservation-compliance-regulation' => [
        'overview' => [
            'ar' => [
                'يعنى هذا المشروع بإعداد وبدء تطبيق اللائحة التنفيذية للمراقبة والالتزام بمعايير الكفاءة والترشيد لدى المركز الوطني لكفاءة وترشيد المياه، من خلال مراجعة الأطر التنظيمية القائمة وتحديد الجهات والأنشطة التي تشملها اللائحة.',
                'ويشمل العمل صياغة مواد اللائحة وإجراءات الرقابة وآليات التحقق من الالتزام، وتوضيح الأدوار والمسؤوليات بين الجهات ذات العلاقة، ومساندة المركز في مرحلة بدء التطبيق بالتعريف باللائحة وبناء أدوات المتابعة.',
            ],
            'en' => [
                'This project prepares and launches the executive regulation for monitoring compliance with efficiency and conservation standards at the National Center for Water Efficiency and Conservation, by reviewing the existing regulatory frameworks and identifying the entities and activities the regulation covers.',
                'The work includes drafting the regulation\'s articles, control procedures and compliance verification mechanisms, clarifying roles and responsibilities among the relevant entities, and supporting the center at launch by introducing the regulation and building monitoring tools.',
            ],
        ],
        'scope' => [
            'ar' => ['مراجعة الأطر التنظيمية القائمة', 'تحديد الجهات والأنشطة المشمولة', 'صياغة مواد اللائحة وإجراءات الرقابة', 'توضيح الأدوار والمسؤوليات', 'مساندة بدء التطبيق وبناء أدوات المتابعة'],
            'en' => ['Reviewing existing regulatory frameworks', 'Identifying the entities and activities covered', 'Drafting the regulation\'s articles and control procedures', 'Clarifying roles and responsibilities', 'Supporting launch and building monitoring tools'],
        ],
        'service_type' => ['ar' => 'استشارات', 'en' => 'Consulting'],
        'location' => null,
        'regions' => [],
        'gallery' => ['wave', 'facade'],
    ],

    'technical-standards-unification' => [
        'overview' => [
            'ar' => [
                'يهدف هذا المشروع إلى توحيد المعايير الفنية لدى المرشدين بالتعاون مع الجهات ذات العلاقة، من خلال حصر المعايير والممارسات المعمول بها، وتحليل أوجه الاختلاف بينها وأثرها في جودة أعمال الترشيد.',
                'ويشمل العمل تنسيق المناقشات الفنية مع الجهات المعنية، وإعداد مرجع موحد للمعايير والمصطلحات وإجراءات الفحص، ووضع إرشادات عملية لتطبيقه، مع تقديم برامج تعريفية تساعد المرشدين على الالتزام بالمنهج الموحد في أعمالهم الميدانية.',
            ],
            'en' => [
                'This project aims to unify technical standards among advisors in cooperation with the relevant entities, by inventorying the standards and practices in use and analyzing how they differ and how those differences affect the quality of conservation work.',
                'The work includes coordinating technical discussions with the entities concerned, preparing one reference for standards, terminology and inspection procedures, and setting practical guidance for applying it, along with introductory programs that help advisors follow the unified approach in their field work.',
            ],
        ],
        'scope' => [
            'ar' => ['حصر المعايير والممارسات المعمول بها', 'تحليل أوجه الاختلاف بين المعايير', 'تنسيق المناقشات الفنية مع الجهات المعنية', 'إعداد المرجع الموحد للمعايير وإجراءات الفحص', 'تقديم البرامج التعريفية للمرشدين'],
            'en' => ['Inventorying the standards and practices in use', 'Analyzing differences between standards', 'Coordinating technical discussions with the entities concerned', 'Preparing the unified reference for standards and inspection procedures', 'Delivering introductory programs for advisors'],
        ],
        'service_type' => ['ar' => 'استشارات', 'en' => 'Consulting'],
        'location' => null,
        'regions' => [],
        'gallery' => ['aerial', 'building', 'wave'],
    ],

    'irrigation-projects-design-framework-agreement' => [
        'overview' => [
            'ar' => [
                'تغطي هذه الاتفاقية الإطارية أعمال تصميم مشاريع المؤسسة العامة للري، وفق إطار تعاقدي يتيح إسناد المشاريع تباعًا بحسب احتياجات المؤسسة، مع توحيد منهجية إعداد الدراسات والتصاميم عبر المشاريع المختلفة.',
                'ويشمل نطاق الخدمات إجراء الدراسات الميدانية والهيدروليكية، وإعداد التصاميم المدنية للمنشآت والشبكات، وتجهيز المواصفات وجداول الكميات ووثائق الطرح، والتنسيق مع فرق المؤسسة لمراجعة مخرجات كل مشروع قبل اعتماده.',
            ],
            'en' => [
                'This framework agreement covers the design of General Irrigation Organization projects under a contractual framework that allows projects to be assigned in turn according to the organization\'s needs, while standardizing how studies and designs are prepared across projects.',
                'The scope of services includes field and hydraulic studies, civil designs for structures and networks, specifications, bills of quantities and tender documents, and coordination with the organization\'s teams to review each project\'s outputs before approval.',
            ],
        ],
        'scope' => [
            'ar' => ['الدراسات الميدانية والهيدروليكية', 'التصاميم المدنية للمنشآت والشبكات', 'إعداد المواصفات وجداول الكميات', 'تجهيز وثائق الطرح', 'مراجعة المخرجات مع فرق المؤسسة'],
            'en' => ['Field and hydraulic studies', 'Civil designs for structures and networks', 'Preparing specifications and bills of quantities', 'Preparing tender documents', 'Reviewing outputs with the organization\'s teams'],
        ],
        'service_type' => ['ar' => 'تصميم', 'en' => 'Design'],
        'location' => null,
        'regions' => [],
        'gallery' => ['sunset', 'aerial'],
    ],

    'dam-projects-consulting-services' => [
        'overview' => [
            'ar' => [
                'يقدم هذا المشروع خدمات استشارية لمشاريع السدود في جازان وعسير ونجران والباحة ومكة المكرمة لصالح المؤسسة العامة للري، مع مراعاة اختلاف الطبيعة الجغرافية والمتطلبات الفنية لكل منطقة من مناطق العمل.',
                'وتشمل الخدمات مراجعة الدراسات والتصاميم القائمة، ومتابعة الأعمال الميدانية، وتقييم الجوانب الفنية للمنشآت وعوامل السلامة فيها، وإعداد تقارير موحدة تساعد المؤسسة على متابعة المشاريع في المناطق المختلفة وترتيب أولوياتها.',
            ],
            'en' => [
                'This project provides consulting services for dam projects in Jazan, Asir, Najran, Al-Baha and Makkah for the General Irrigation Organization, taking into account the differing geography and technical requirements of each work area.',
                'Services include reviewing existing studies and designs, following up on field work, assessing the technical and safety aspects of the structures, and preparing consistent reports that help the organization track projects across regions and set priorities.',
            ],
        ],
        'scope' => [
            'ar' => ['مراجعة الدراسات والتصاميم القائمة', 'متابعة الأعمال الميدانية في مناطق المشروع', 'تقييم الجوانب الفنية وعوامل السلامة للمنشآت', 'تنسيق الأعمال مع فرق المؤسسة', 'إعداد التقارير الموحدة وترتيب الأولويات'],
            'en' => ['Reviewing existing studies and designs', 'Following up on field work across project regions', 'Assessing technical and safety aspects of structures', 'Coordinating work with the organization\'s teams', 'Preparing consistent reports and setting priorities'],
        ],
        'service_type' => ['ar' => 'استشارات', 'en' => 'Consulting'],
        'location' => ['ar' => 'جازان – عسير – نجران – الباحة – مكة المكرمة', 'en' => 'Jazan – Asir – Najran – Al-Baha – Makkah'],
        'regions' => ['jazan', 'asir', 'najran', 'al-baha', 'makkah'],
        'gallery' => ['wave', 'sunset', 'truss'],
    ],

    'king-faisal-university-operation-and-maintenance-efficiency' => [
        'overview' => [
            'ar' => [
                'يقدّم هذا المشروع خدمات استشارية لرفع كفاءة عمليات التشغيل والصيانة في جامعة الملك فيصل، من خلال حصر أصول المدينة الجامعية وتوثيقها وتقييم حالتها الفنية، وتحليل واقع خدمات التشغيل في المباني والمرافق التعليمية.',
                'ويشمل العمل تطوير خطط الصيانة الوقائية والتصحيحية بما يلائم التقويم الأكاديمي، وتطبيق نظام CAFM وربط أوامر العمل ببيانات الأصول، ومراجعة عقود التشغيل، وتأهيل الكوادر الفنية والإدارية لإدارة المرافق بأسلوب موحد.',
            ],
            'en' => [
                'This project provides consulting services to improve operation and maintenance efficiency at King Faisal University, by inventorying, documenting and assessing the technical condition of campus assets and analyzing how operating services run across its academic buildings and facilities.',
                'The work includes developing preventive and corrective maintenance plans that suit the academic calendar, implementing a CAFM system that links work orders to asset data, reviewing operating contracts, and training technical and administrative staff to manage facilities in one consistent way.',
            ],
        ],
        'scope' => [
            'ar' => ['حصر أصول المدينة الجامعية وتوثيقها', 'تقييم الحالة الفنية للمباني والمرافق', 'تطوير خطط الصيانة الوقائية والتصحيحية', 'تطبيق نظام CAFM وربط أوامر العمل بالأصول', 'مراجعة عقود التشغيل والصيانة', 'تأهيل الكوادر الفنية والإدارية'],
            'en' => ['Inventorying and documenting campus assets', 'Assessing the technical condition of buildings and facilities', 'Developing preventive and corrective maintenance plans', 'Implementing a CAFM system and linking work orders to assets', 'Reviewing operation and maintenance contracts', 'Training technical and administrative staff'],
        ],
        'service_type' => ['ar' => 'استشارات', 'en' => 'Consulting'],
        'location' => ['ar' => 'الأحساء', 'en' => 'Al-Ahsa'],
        'regions' => ['eastern-province'],
        'gallery' => ['building', 'facade', 'riyadh_teal'],
    ],

    'king-saud-university-operation-and-maintenance-efficiency' => [
        'overview' => [
            'ar' => [
                'يركز هذا المشروع على تقديم الخدمات الاستشارية لرفع كفاءة عمليات التشغيل والصيانة في جامعة الملك سعود، عبر تقييم الوضع الراهن للأصول في مرافق الجامعة وتوثيقها، وتحديد الفجوات في أساليب التشغيل والصيانة المتبعة.',
                'وتشمل الأعمال تطوير خطط الصيانة الوقائية والتصحيحية، وبناء نموذج تشغيلي موحد، وتطبيق نظام CAFM وربط البيانات بلوحات المؤشرات لدعم القرارات التشغيلية، إلى جانب تأهيل الكوادر الفنية والإدارية وبناء قدراتها.',
            ],
            'en' => [
                'This project focuses on providing consulting services to improve operation and maintenance efficiency at King Saud University, by assessing and documenting the current state of assets across university facilities and identifying gaps in the operating and maintenance methods in use.',
                'The work includes developing preventive and corrective maintenance plans, building one operating model, implementing a CAFM system and linking data to dashboards that support operational decisions, along with training technical and administrative staff and building their capabilities.',
            ],
        ],
        'scope' => [
            'ar' => ['حصر وتوثيق الأصول وتقييم حالتها الفنية', 'تطوير خطط الصيانة الوقائية والتصحيحية', 'بناء نموذج تشغيلي موحد', 'تطبيق نظام CAFM وربط البيانات بلوحات المؤشرات', 'تأهيل الكوادر الفنية والإدارية وبناء القدرات'],
            'en' => ['Asset inventory, documentation and technical condition assessment', 'Developing preventive and corrective maintenance plans', 'Building one operating model', 'Implementing a CAFM system and linking data to dashboards', 'Training technical and administrative staff and building capabilities'],
        ],
        'service_type' => ['ar' => 'استشارات', 'en' => 'Consulting'],
        'location' => ['ar' => 'الرياض', 'en' => 'Riyadh'],
        'regions' => ['riyadh'],
        'gallery' => ['facade', 'building'],
    ],

    'al-hayat-national-hospitals-operation-and-maintenance-supervision' => [
        'overview' => [
            'ar' => [
                'يتناول هذا المشروع الإشراف على تشغيل وصيانة مجموعة مستشفيات الحياة الوطني التابعة لمجموعة بن جار الله، مع مراعاة ما تتطلبه البيئة الصحية من استمرارية في الخدمات وانضباط في تنفيذ أعمال الصيانة داخل المرافق.',
                'ويشمل الإشراف متابعة أداء مقاولي التشغيل والصيانة، والتحقق من الالتزام بخطط الصيانة الوقائية والتصحيحية، ومراجعة متطلبات سلامة الحياة والأنظمة الكهروميكانيكية الحرجة، وإعداد تقارير دورية تساعد إدارة المجموعة على متابعة حالة المرافق.',
            ],
            'en' => [
                'This project covers the supervision of operation and maintenance for the Al Hayat National Hospitals group under the Bin Jarallah Group, taking into account the continuity of services and the discipline in maintenance work that healthcare settings require.',
                'Supervision includes monitoring the performance of operation and maintenance contractors, verifying adherence to preventive and corrective maintenance plans, reviewing life-safety requirements and critical electromechanical systems, and preparing periodic reports that help group management follow the condition of its facilities.',
            ],
        ],
        'scope' => [
            'ar' => ['متابعة أداء مقاولي التشغيل والصيانة', 'التحقق من تنفيذ خطط الصيانة الوقائية والتصحيحية', 'مراجعة متطلبات سلامة الحياة', 'متابعة الأنظمة الكهروميكانيكية الحرجة', 'إعداد التقارير الدورية لإدارة المجموعة'],
            'en' => ['Monitoring the performance of operation and maintenance contractors', 'Verifying delivery of preventive and corrective maintenance plans', 'Reviewing life-safety requirements', 'Following up on critical electromechanical systems', 'Preparing periodic reports for group management'],
        ],
        'service_type' => ['ar' => 'إشراف', 'en' => 'Supervision'],
        'location' => null,
        'regions' => [],
        'gallery' => ['facade', 'building', 'night'],
    ],

    'bin-jarallah-facility-management-technical-support' => [
        'overview' => [
            'ar' => [
                'يقدم هذا المشروع الدعم الفني لبعض مشاريع التشغيل والصيانة وإدارة المرافق بمجموعة بن جار الله، من خلال مساندة فرق المشاريع في المسائل الفنية ومراجعة أساليب التنفيذ والتوثيق المتبعة في المواقع.',
                'ويشمل الدعم مراجعة خطط الصيانة وإجراءات إدارة أوامر العمل والمقاولين، وتقديم المشورة في إدارة الأصول والمرافق، ومتابعة معالجة الملاحظات الفنية، وتوحيد نماذج التقارير بما يسهّل على إدارة المجموعة متابعة مشاريعها.',
            ],
            'en' => [
                'This project provides technical support for selected operation and maintenance and facility management projects at the Bin Jarallah Group, by assisting project teams on technical matters and reviewing the execution and documentation methods used on site.',
                'Support includes reviewing maintenance plans and work order and contractor management procedures, advising on asset and facility management, following up on the resolution of technical observations, and standardizing report templates so group management can follow its projects more easily.',
            ],
        ],
        'scope' => [
            'ar' => ['مساندة فرق المشاريع في المسائل الفنية', 'مراجعة خطط الصيانة وإجراءات أوامر العمل', 'تقديم المشورة في إدارة الأصول والمرافق', 'متابعة معالجة الملاحظات الفنية', 'توحيد نماذج التقارير'],
            'en' => ['Assisting project teams on technical matters', 'Reviewing maintenance plans and work order procedures', 'Advising on asset and facility management', 'Following up on the resolution of technical observations', 'Standardizing report templates'],
        ],
        'service_type' => ['ar' => 'دعم فني', 'en' => 'Technical support'],
        'location' => null,
        'regions' => [],
        'gallery' => ['truss', 'building'],
    ],

    'school-buildings-contracts-supervision-central-and-northern' => [
        'overview' => [
            'ar' => [
                'يتناول هذا المشروع الإشراف على العقود القائمة بوزارة التربية والتعليم في المنطقة الوسطى والشمالية للمباني المدرسية، بما يشمل متابعة أعمال المقاولين في المواقع والتحقق من التزامها بشروط العقود ومواصفاتها.',
                'ويعتمد العمل على مراجعة البرامج الزمنية ومستخلصات الأعمال، وضبط الجودة ومتطلبات السلامة داخل البيئة المدرسية، وتنسيق معالجة الملاحظات مع المقاولين، ورفع تقارير دورية توضح حالة العقود في كل منطقة.',
            ],
            'en' => [
                'This project covers the supervision of existing Ministry of Education contracts for school buildings in the Central and Northern regions, including following up on contractors\' work on site and verifying compliance with contract terms and specifications.',
                'The work relies on reviewing schedules and payment applications, controlling quality and safety requirements within the school environment, coordinating the resolution of observations with contractors, and submitting periodic reports showing the status of contracts in each region.',
            ],
        ],
        'scope' => [
            'ar' => ['متابعة أعمال المقاولين في المواقع', 'التحقق من الالتزام بشروط العقود ومواصفاتها', 'مراجعة البرامج الزمنية ومستخلصات الأعمال', 'ضبط الجودة ومتطلبات السلامة في البيئة المدرسية', 'إعداد التقارير الدورية لحالة العقود'],
            'en' => ['Following up on contractors\' work on site', 'Verifying compliance with contract terms and specifications', 'Reviewing schedules and payment applications', 'Controlling quality and safety requirements in the school environment', 'Preparing periodic contract status reports'],
        ],
        'service_type' => ['ar' => 'إشراف', 'en' => 'Supervision'],
        'location' => ['ar' => 'المنطقة الوسطى والشمالية', 'en' => 'Central and Northern regions'],
        'regions' => [],
        'gallery' => ['building', 'facade', 'sunset'],
    ],

    'school-facility-management-supervision-framework-agreement' => [
        'overview' => [
            'ar' => [
                'تغطي هذه الاتفاقية الإطارية خدمات الإشراف على مشاريع إدارة المرافق للمباني المدرسية في المنطقة الوسطى والشمالية، ضمن إطار تعاقدي يوحّد منهجية الإشراف ويتيح إسناد أعمال المتابعة بحسب احتياجات المدارس.',
                'وتشمل الخدمات متابعة تنفيذ أعمال التشغيل والصيانة والنظافة، والتحقق من الالتزام بخطط الصيانة ومستويات الخدمة التعاقدية، وتوثيق الملاحظات ومتابعة معالجتها، وإعداد تقارير دورية تدعم إدارة العقود في مناطق العمل.',
            ],
            'en' => [
                'This framework agreement covers supervision services for facility management projects at school buildings in the Central and Northern regions, under a contractual framework that standardizes the supervision approach and allows follow-up work to be assigned according to schools\' needs.',
                'Services include following up on operation, maintenance and cleaning works, verifying adherence to maintenance plans and contractual service levels, documenting observations and tracking their resolution, and preparing periodic reports that support contract management across work areas.',
            ],
        ],
        'scope' => [
            'ar' => ['متابعة أعمال التشغيل والصيانة والنظافة', 'التحقق من الالتزام بخطط الصيانة', 'مراجعة مستويات الخدمة التعاقدية', 'توثيق الملاحظات ومتابعة معالجتها', 'إعداد التقارير الدورية لإدارة العقود'],
            'en' => ['Following up on operation, maintenance and cleaning works', 'Verifying adherence to maintenance plans', 'Reviewing contractual service levels', 'Documenting observations and tracking their resolution', 'Preparing periodic reports for contract management'],
        ],
        'service_type' => ['ar' => 'إشراف', 'en' => 'Supervision'],
        'location' => ['ar' => 'المنطقة الوسطى والشمالية', 'en' => 'Central and Northern regions'],
        'regions' => [],
        'gallery' => ['riyadh_teal', 'facade'],
    ],

    'southern-region-facility-management-supervision' => [
        'overview' => [
            'ar' => [
                'يتناول هذا المشروع الإشراف على إدارة المرافق في المنطقة الجنوبية، بما يشمل أعمال التشغيل والصيانة وصيانة التكييف والنظافة في المباني المدرسية، مع مراعاة انتشار المواقع واختلاف الظروف المناخية بين أجزاء المنطقة.',
                'ويشمل الإشراف زيارات ميدانية منتظمة للتحقق من تنفيذ الأعمال وفق الخطط المعتمدة، ومتابعة أداء المقاولين وأوامر العمل، وفحص جاهزية أنظمة التكييف، وتوثيق الملاحظات ورفعها في تقارير دورية إلى الجهة المالكة.',
            ],
            'en' => [
                'This project covers the supervision of facility management in the Southern Region, including operation and maintenance, air-conditioning maintenance and cleaning in school buildings, taking into account the spread of sites and the differing climate conditions across the region.',
                'Supervision includes regular field visits to verify that works follow the approved plans, monitoring contractors\' performance and work orders, checking the readiness of air-conditioning systems, and documenting observations in periodic reports to the owner.',
            ],
        ],
        'scope' => [
            'ar' => ['الزيارات الميدانية المنتظمة للمواقع', 'متابعة أعمال التشغيل والصيانة والنظافة', 'فحص جاهزية أنظمة التكييف', 'متابعة أداء المقاولين وأوامر العمل', 'إعداد التقارير الدورية للجهة المالكة'],
            'en' => ['Regular field visits to sites', 'Following up on operation, maintenance and cleaning works', 'Checking the readiness of air-conditioning systems', 'Monitoring contractors\' performance and work orders', 'Preparing periodic reports for the owner'],
        ],
        'service_type' => ['ar' => 'إشراف', 'en' => 'Supervision'],
        'location' => ['ar' => 'المنطقة الجنوبية', 'en' => 'Southern Region'],
        'regions' => [],
        'gallery' => ['building', 'riyadh_teal', 'facade'],
    ],

    'western-region-education-projects-study' => [
        'overview' => [
            'ar' => [
                'تتناول هذه الدراسة مشاريع وزارة التعليم الجاري تنفيذها في المنطقة الغربية، بهدف تكوين صورة موحدة عن وضع هذه المشاريع من حيث تقدم الأعمال ومطابقتها للمخططات والعقود والمتطلبات الفنية.',
                'وتعتمد الدراسة على مراجعة وثائق المشاريع وزيارة مواقعها، وتحليل أسباب التأخير والمعوقات الفنية والتعاقدية إن وجدت، وتصنيف المشاريع بحسب حالتها، وتقديم توصيات عملية تساعد الجهة المالكة على ترتيب أولويات المعالجة.',
            ],
            'en' => [
                'This study covers Ministry of Education projects under way in the Western Region, with the aim of forming one consistent picture of their status in terms of progress and conformity with drawings, contracts and technical requirements.',
                'The study relies on reviewing project documents and visiting sites, analyzing the causes of any delays and technical or contractual obstacles, classifying projects by status, and providing practical recommendations that help the owner prioritize corrective actions.',
            ],
        ],
        'scope' => [
            'ar' => ['مراجعة وثائق المشاريع وعقودها', 'زيارة المواقع وتقييم تقدم الأعمال', 'تحليل المعوقات الفنية والتعاقدية', 'تصنيف المشاريع بحسب حالتها', 'تقديم التوصيات وأولويات المعالجة'],
            'en' => ['Reviewing project documents and contracts', 'Visiting sites and assessing progress', 'Analyzing technical and contractual obstacles', 'Classifying projects by status', 'Providing recommendations and corrective priorities'],
        ],
        'service_type' => ['ar' => 'دراسات', 'en' => 'Studies'],
        'location' => ['ar' => 'المنطقة الغربية', 'en' => 'Western Region'],
        'regions' => [],
        'gallery' => ['riyadh_teal', 'building'],
    ],

    'king-abdulaziz-hospital-site-development' => [
        'overview' => [
            'ar' => [
                'يتناول هذا المشروع تطوير الموقع العام لمستشفى الملك عبد العزيز لصالح وزارة الصحة، من خلال دراسة الوضع القائم للموقع وحركة المرضى والزوار والمركبات، وتحديد احتياجات المستشفى من الساحات والممرات ومسارات الخدمات.',
                'ويشمل العمل إعداد المخطط العام وتصاميم الطرق ومواقف السيارات والمناظر الطبيعية وشبكات البنية التحتية، مع مراعاة وصول مركبات الطوارئ ومتطلبات سلامة الحياة، وتنسيق أعمال التطوير بما يحافظ على استمرار خدمات المستشفى.',
            ],
            'en' => [
                'This project covers site development for King Abdulaziz Hospital for the Ministry of Health, by studying the current state of the site and the movement of patients, visitors and vehicles, and identifying the hospital\'s needs for courtyards, walkways and service routes.',
                'The work includes preparing the master plan and designs for roads, parking, landscaping and infrastructure networks, taking into account emergency vehicle access and life-safety requirements, and coordinating development works so the hospital\'s services continue.',
            ],
        ],
        'scope' => [
            'ar' => ['دراسة الوضع القائم للموقع وحركة الزوار والمركبات', 'إعداد المخطط العام للموقع', 'تصميم الطرق ومواقف السيارات والمناظر الطبيعية', 'تصميم شبكات البنية التحتية', 'مراعاة وصول الطوارئ ومتطلبات سلامة الحياة'],
            'en' => ['Studying the current site and visitor and vehicle movement', 'Preparing the site master plan', 'Designing roads, parking and landscaping', 'Designing infrastructure networks', 'Addressing emergency access and life-safety requirements'],
        ],
        'service_type' => ['ar' => 'تطوير الموقع العام', 'en' => 'Site development'],
        'location' => null,
        'regions' => [],
        'gallery' => ['building', 'riyadh_teal', 'night'],
    ],

    'ambulance-centers-design-and-supervision' => [
        'overview' => [
            'ar' => [
                'يشمل هذا المشروع دراسة وتصميم المراكز الإسعافية والإشراف على تنفيذها لصالح هيئة الهلال الأحمر السعودي، انطلاقًا من دراسة احتياجات التشغيل الإسعافي ومتطلبات الاستجابة السريعة وخصائص كل موقع من مواقع المراكز.',
                'وتشمل الخدمات إعداد التصاميم المعمارية والإنشائية والكهروميكانيكية بما يلائم حركة سيارات الإسعاف وفرق العمل، ثم الإشراف على أعمال الإنشاء في المواقع والتحقق من مطابقتها للمواصفات ومتطلبات السلامة حتى مرحلة التسليم.',
            ],
            'en' => [
                'This project covers the study, design and construction supervision of ambulance centers for the Saudi Red Crescent Authority, starting with a study of ambulance operating needs, rapid response requirements and the characteristics of each center\'s site.',
                'Services include architectural, structural and electromechanical designs suited to the movement of ambulances and crews, followed by supervision of construction on site and verification of conformity with specifications and safety requirements through to handover.',
            ],
        ],
        'scope' => [
            'ar' => ['دراسة احتياجات التشغيل الإسعافي', 'دراسة خصائص مواقع المراكز', 'إعداد التصاميم المعمارية والإنشائية والكهروميكانيكية', 'الإشراف على أعمال الإنشاء في المواقع', 'التحقق من المواصفات ومتطلبات السلامة حتى التسليم'],
            'en' => ['Studying ambulance operating needs', 'Studying the characteristics of center sites', 'Preparing architectural, structural and electromechanical designs', 'Supervising construction on site', 'Verifying specifications and safety requirements through to handover'],
        ],
        'service_type' => ['ar' => 'دراسات وتصميم وإشراف', 'en' => 'Studies, design and supervision'],
        'location' => null,
        'regions' => [],
        'gallery' => ['facade', 'night'],
    ],

    'eastern-province-courts-and-notary-buildings-supervision' => [
        'overview' => [
            'ar' => [
                'يتناول هذا المشروع استكمال الإشراف على مشروع إنشاء مباني المحاكم وكتابات العدل في المنطقة الشرقية لصالح وزارة العدل، بدءًا من مراجعة وضع الأعمال القائمة ووثائقها وتحديد ما تبقى من متطلبات التنفيذ.',
                'ويشمل الإشراف متابعة أعمال المقاولين والتحقق من مطابقتها للمخططات والمواصفات، وضبط الجودة ومتطلبات السلامة، ومراجعة البرامج الزمنية ومستخلصات الأعمال، والتنسيق مع الوزارة في مراحل الفحص والتسليم لمباني المحاكم وكتابات العدل.',
            ],
            'en' => [
                'This project covers completing the supervision of the construction of court and notary buildings in the Eastern Province for the Ministry of Justice, beginning with a review of the status of existing works and their documents and identifying the remaining execution requirements.',
                'Supervision includes following up on contractors\' works and verifying conformity with drawings and specifications, controlling quality and safety requirements, reviewing schedules and payment applications, and coordinating with the ministry during inspection and handover of the court and notary buildings.',
            ],
        ],
        'scope' => [
            'ar' => ['مراجعة وضع الأعمال القائمة ووثائقها', 'متابعة أعمال المقاولين في المواقع', 'التحقق من المطابقة للمخططات والمواصفات', 'ضبط الجودة ومتطلبات السلامة', 'مراجعة البرامج الزمنية ومستخلصات الأعمال', 'التنسيق في مراحل الفحص والتسليم'],
            'en' => ['Reviewing the status of existing works and their documents', 'Following up on contractors\' works on site', 'Verifying conformity with drawings and specifications', 'Controlling quality and safety requirements', 'Reviewing schedules and payment applications', 'Coordinating inspection and handover stages'],
        ],
        'service_type' => ['ar' => 'إشراف', 'en' => 'Supervision'],
        'location' => ['ar' => 'المنطقة الشرقية', 'en' => 'Eastern Province'],
        'regions' => ['eastern-province'],
        'gallery' => ['night', 'aerial', 'facade'],
    ],

    'courts-of-appeal-design-and-supervision-phase-two' => [
        'overview' => [
            'ar' => [
                'يشمل هذا المشروع المرحلة الثانية من التصميم والإشراف على محاكم الاستئناف لوزارة العدل، من خلال إعداد التصاميم المعمارية والإنشائية والكهروميكانيكية بما يلائم طبيعة المرافق القضائية وتنظيم حركة المراجعين والعاملين فيها.',
                'وتمتد الخدمات إلى الإشراف على أعمال التنفيذ في المواقع، والتحقق من مطابقتها للمخططات والمواصفات ومتطلبات سلامة الحياة، وتنسيق الأعمال بين التخصصات الهندسية، ومراجعة متطلبات التسليم مع الوزارة في هذه المرحلة.',
            ],
            'en' => [
                'This project covers phase two of the design and supervision of the courts of appeal for the Ministry of Justice, through architectural, structural and electromechanical designs suited to judicial facilities and to organizing the movement of visitors and staff within them.',
                'Services extend to supervising execution on site, verifying conformity with drawings, specifications and life-safety requirements, coordinating work across engineering disciplines, and reviewing handover requirements with the ministry during this phase.',
            ],
        ],
        'scope' => [
            'ar' => ['إعداد التصاميم المعمارية والإنشائية', 'تصميم الأنظمة الكهروميكانيكية', 'تنظيم حركة المراجعين والعاملين في المرافق القضائية', 'الإشراف على أعمال التنفيذ في المواقع', 'التحقق من متطلبات سلامة الحياة', 'مراجعة متطلبات التسليم مع الوزارة'],
            'en' => ['Preparing architectural and structural designs', 'Designing electromechanical systems', 'Organizing the movement of visitors and staff in judicial facilities', 'Supervising execution on site', 'Verifying life-safety requirements', 'Reviewing handover requirements with the ministry'],
        ],
        'service_type' => ['ar' => 'تصميم وإشراف', 'en' => 'Design and supervision'],
        'location' => null,
        'regions' => [],
        'gallery' => ['building', 'aerial'],
    ],

    'central-riyadh-heritage-buildings-restoration' => [
        'overview' => [
            'ar' => [
                'يعنى هذا المشروع بترميم مباني التراث المعماري وسط الرياض لصالح وزارة الثقافة، انطلاقًا من توثيق المباني توثيقًا معماريًا وإنشائيًا وتقييم حالتها الراهنة، وتحديد عناصرها التراثية التي ينبغي الحفاظ عليها.',
                'ويشمل العمل إعداد منهجية ترميم تراعي مواد البناء التقليدية وأساليبها، وتصميم الحلول اللازمة لتدعيم المباني، ومتابعة أعمال الترميم في الموقع، والتحقق من توافقها مع متطلبات الحفاظ على الطابع المعماري ومتطلبات السلامة.',
            ],
            'en' => [
                'This project covers the restoration of architectural heritage buildings in central Riyadh for the Ministry of Culture, starting with architectural and structural documentation of the buildings, assessment of their current condition, and identification of the heritage elements to be preserved.',
                'The work includes preparing a restoration methodology that respects traditional building materials and techniques, designing the solutions needed to strengthen the buildings, following up on restoration works on site, and verifying that they meet architectural conservation and safety requirements.',
            ],
        ],
        'scope' => [
            'ar' => ['التوثيق المعماري والإنشائي للمباني', 'تقييم الحالة الراهنة وتحديد العناصر التراثية', 'إعداد منهجية الترميم بالمواد التقليدية', 'تصميم حلول تدعيم المباني', 'متابعة أعمال الترميم في الموقع'],
            'en' => ['Architectural and structural documentation of the buildings', 'Assessing current condition and identifying heritage elements', 'Preparing a restoration methodology using traditional materials', 'Designing building strengthening solutions', 'Following up on restoration works on site'],
        ],
        'service_type' => ['ar' => 'ترميم', 'en' => 'Restoration'],
        'location' => ['ar' => 'وسط الرياض', 'en' => 'Central Riyadh'],
        'regions' => ['riyadh'],
        'gallery' => ['night', 'sunset', 'riyadh_teal'],
    ],

    'sports-facilities-efficiency-and-development' => [
        'overview' => [
            'ar' => [
                'يقدم هذا المشروع خدمات استشارية وفنية لرفع كفاءة المنشآت الرياضية وتطويرها لصالح وزارة الرياضة، من خلال حصر المنشآت وتوثيق أصولها وتقييم حالتها الفنية ومدى ملاءمتها لاستخدامات الأنشطة الرياضية المختلفة.',
                'ويشمل العمل تحديد احتياجات التطوير وترتيب أولوياتها، وتطوير خطط التشغيل والصيانة بما يناسب طبيعة المنشآت، ومراجعة متطلبات السلامة للمرتادين، وصياغة توصيات فنية تساعد الوزارة على إدارة منشآتها بأسلوب موحد.',
            ],
            'en' => [
                'This project provides consulting and technical services to improve the efficiency of and develop sports facilities for the Ministry of Sport, by inventorying the facilities, documenting their assets, and assessing their technical condition and suitability for different sporting activities.',
                'The work includes identifying and prioritizing development needs, developing operation and maintenance plans suited to the facilities, reviewing safety requirements for users, and formulating technical recommendations that help the ministry manage its facilities in one consistent way.',
            ],
        ],
        'scope' => [
            'ar' => ['حصر المنشآت الرياضية وتوثيق أصولها', 'تقييم الحالة الفنية ومدى ملاءمة الاستخدام', 'تحديد احتياجات التطوير وترتيب أولوياتها', 'تطوير خطط التشغيل والصيانة', 'مراجعة متطلبات سلامة المرتادين'],
            'en' => ['Inventorying sports facilities and documenting their assets', 'Assessing technical condition and suitability for use', 'Identifying and prioritizing development needs', 'Developing operation and maintenance plans', 'Reviewing user safety requirements'],
        ],
        'service_type' => ['ar' => 'استشارات', 'en' => 'Consulting'],
        'location' => null,
        'regions' => [],
        'gallery' => ['wave', 'aerial', 'facade'],
    ],

    'social-development-bank-engineering-projects-supervision' => [
        'overview' => [
            'ar' => [
                'يتناول هذا المشروع تقديم الخدمات الاستشارية للإشراف على المشاريع الهندسية ببنك التنمية الاجتماعية، بما يشمل متابعة تنفيذ الأعمال في مواقع البنك والتحقق من مطابقتها للتصاميم والمواصفات ومتطلبات الجهة المالكة.',
                'ويعتمد الإشراف على مراجعة المخططات التنفيذية والبرامج الزمنية ومستخلصات الأعمال، وضبط الجودة ومتطلبات السلامة أثناء العمل في مبانٍ قائمة، وتقديم تقارير دورية تساعد البنك على متابعة مشاريعه الهندسية واتخاذ قراراته.',
            ],
            'en' => [
                'This project provides consulting services for supervising engineering projects at the Social Development Bank, including following up on execution at the bank\'s sites and verifying conformity with designs, specifications and the owner\'s requirements.',
                'Supervision relies on reviewing shop drawings, schedules and payment applications, controlling quality and safety requirements while working in occupied buildings, and providing periodic reports that help the bank follow its engineering projects and make decisions.',
            ],
        ],
        'scope' => [
            'ar' => ['مراجعة المخططات التنفيذية', 'متابعة تنفيذ الأعمال في المواقع', 'التحقق من المطابقة للتصاميم والمواصفات', 'ضبط الجودة ومتطلبات السلامة', 'مراجعة البرامج الزمنية ومستخلصات الأعمال', 'إعداد التقارير الدورية للبنك'],
            'en' => ['Reviewing shop drawings', 'Following up on execution on site', 'Verifying conformity with designs and specifications', 'Controlling quality and safety requirements', 'Reviewing schedules and payment applications', 'Preparing periodic reports for the bank'],
        ],
        'service_type' => ['ar' => 'إشراف', 'en' => 'Supervision'],
        'location' => null,
        'regions' => [],
        'gallery' => ['building', 'night'],
    ],

    'investment-consulting-framework-agreement' => [
        'overview' => [
            'ar' => [
                'تغطي هذه الاتفاقية الإطارية المفتوحة تقديم خدمات استشارية في مجالي التصميم والإشراف لصالح وزارة الاستثمار، ضمن إطار تعاقدي يتيح إسناد الأعمال بحسب احتياجات الوزارة مع توحيد منهجية العمل وآليات المتابعة.',
                'وتشمل الخدمات إعداد التصاميم الهندسية ومراجعتها لكل عمل يسند ضمن الاتفاقية، والإشراف على التنفيذ والتحقق من مطابقته للمواصفات، وإدارة التنسيق مع الجهات المعنية، وتقديم تقارير دورية تتيح للوزارة متابعة الأعمال المسندة.',
            ],
            'en' => [
                'This open framework agreement covers consulting services in design and supervision for the Ministry of Investment, under a contractual framework that allows work to be assigned according to the ministry\'s needs while standardizing the working approach and follow-up mechanisms.',
                'Services include preparing and reviewing engineering designs for each assignment under the agreement, supervising execution and verifying conformity with specifications, managing coordination with the entities concerned, and providing periodic reports so the ministry can follow assigned work.',
            ],
        ],
        'scope' => [
            'ar' => ['تحديد متطلبات الأعمال المسندة', 'إعداد التصاميم الهندسية ومراجعتها', 'الإشراف على أعمال التنفيذ', 'التحقق من المطابقة للمواصفات', 'التنسيق مع الجهات المعنية وإعداد التقارير الدورية'],
            'en' => ['Defining the requirements of assigned work', 'Preparing and reviewing engineering designs', 'Supervising execution', 'Verifying conformity with specifications', 'Coordinating with the entities concerned and preparing periodic reports'],
        ],
        'service_type' => ['ar' => 'تصميم وإشراف', 'en' => 'Design and supervision'],
        'location' => null,
        'regions' => [],
        'gallery' => ['building', 'facade', 'night'],
    ],
];
