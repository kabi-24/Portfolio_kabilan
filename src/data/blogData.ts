export type BlogCategory =
  | 'All'
  | 'Computer Vision'
  | 'Robotics'
  | 'NLP Systems'
  | 'Architecture';

export interface BlogSectionBlock {
  heading: string;
  paragraphs: string[];
  codeSnippet?: {
    language: string;
    caption: string;
    code: string;
  };
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: Exclude<BlogCategory, 'All'>;
  publishedAt: string;
  readTime: string;
  featuredImage: string;
  featuredAlt: string;
  excerpt: string;
  keyTakeaways: string[];
  sections: BlogSectionBlock[];
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  'All',
  'Computer Vision',
  'Robotics',
  'NLP Systems',
  'Architecture',
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'yolov8-conveyor-lighting',
    slug: 'stabilizing-yolov8-conveyor-bag-counting-variable-lighting',
    title: 'Stabilizing YOLOv8 Conveyor Bag Counting Under Variable Warehouse Lighting',
    category: 'Computer Vision',
    publishedAt: 'Oct 14, 2026',
    readTime: '6 min read',
    featuredImage: '/src/assets/images/blog_yolov8_conveyor_1795446413455.jpg',
    featuredAlt:
      'Industrial warehouse conveyor carrying woven bags beneath an overhead machine vision camera rig',
    excerpt:
      'How adaptive CLAHE luminance normalization, tripwire hysteresis, and half-precision inference pushed conveyor tracking accuracy past 92% at 30+ FPS.',
    keyTakeaways: [
      'Applying CLAHE strictly to the L-channel in LAB space stabilizes contrast without distorting woven bag texture.',
      'Dual-band virtual tripwire hysteresis eliminates double-counting when bags jitter or pause on rollers.',
      'FP16 inference with fixed input sizing keeps frame drops below 2% during peak shift throughput.',
    ],
    sections: [
      {
        heading: 'Why lab-trained detectors drift on warehouse floors',
        paragraphs: [
          'A YOLOv8 detector trained on clean afternoon footage frequently degrades within hours on an industrial loading bay. Open bay doors cast sharp diagonal shadows across the conveyor belt, sodium vapor overhead fixtures flicker at line frequency, and dust coats camera housings.',
          'During our deployment at NLC Private Limited, raw RGB frames suffered sudden local exposure swings whenever forklifts passed near loading gates. Confidence scores on partially occluded bags dropped from 0.89 to 0.42, triggering missed detections and noisy bounding-box flicker.',
        ],
      },
      {
        heading: 'Luminance normalization before inference',
        paragraphs: [
          'Instead of retraining on synthetic brightness jitter alone, we inserted a deterministic OpenCV pre-processing stage. Converting frames to CIELAB color space allows Contrast Limited Adaptive Histogram Equalization (CLAHE) to equalize luminance independently of color chroma.',
          'Keeping the clip limit conservative (2.0 over an 8x8 tile grid) avoids amplifying sensor noise in shadowed corners while lifting edge gradients along overlapping sack seams.',
        ],
        codeSnippet: {
          language: 'python',
          caption: 'LAB luminance normalization prior to YOLOv8 inference',
          code: `def normalize_conveyor_frame(frame_bgr):
    lab = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2LAB)
    l_chan, a_chan, b_chan = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_eq = clahe.apply(l_chan)
    merged = cv2.merge((l_eq, a_chan, b_chan))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)`,
        },
      },
      {
        heading: 'Tripwire hysteresis for zero double-counts',
        paragraphs: [
          'Single-pixel counting lines fail on real conveyors: belt tension pulses cause bag centroids to oscillate across the threshold line, inflating totals. Replacing a single line with a 24-pixel directional hysteresis zone—requiring a tracked ID to enter the upstream boundary and clear the downstream boundary—removed spurious re-triggers completely.',
          'Combined with lightweight centroid + IoU association across consecutive frames, the system maintained 92%+ tracking accuracy and cut manual inspection time by 40%.',
        ],
      },
    ],
  },
  {
    id: 'amr-lidar-ultrasonic-fusion',
    slug: 'sensor-fusion-warehouse-amrs-lidar-ultrasonic-ros',
    title: 'Sensor Fusion for Warehouse AMRs: Combining 2D LiDAR with Ultrasonic Arrays in ROS',
    category: 'Robotics',
    publishedAt: 'Aug 22, 2026',
    readTime: '7 min read',
    featuredImage: '/src/assets/images/blog_amr_lidar_fusion_1795446414611.jpg',
    featuredAlt:
      'Autonomous mobile robot navigating a modern warehouse aisle with a top-mounted 2D LiDAR turret',
    excerpt:
      'Bridging planar 2D LiDAR blind spots using short-range ultrasonic arrays and layered ROS costmaps to cut field-trial collision errors by 30%.',
    keyTakeaways: [
      'Planar 2D LiDAR misses low-profile pallet forks, shrink-wrapped loads, and transparent glass partitions.',
      'Projecting ultrasonic range cones into a dedicated ROS RangeSensorLayer preserves clean dynamic obstacle clearing.',
      'Calibrating costmap inflation radius against robot footprint braking distance unlocks 98%+ navigation reliability.',
    ],
    sections: [
      {
        heading: 'The blind spot of single-plane 2D LiDAR',
        paragraphs: [
          'Planar 2D LiDAR scanners mounted at 280mm chassis height excel at mapping structural walls and rack uprights, yet warehouse floors are full of hazards outside that single horizontal slice. Forklift tines parked slightly raised, low wooden skids, and specular stretch-wrap film either pass beneath the scan plane or scatter laser returns.',
          'At Robonetics Automation Power Solutions LLP, early AMR corridor trials exposed repeated near-misses with low pallet edges whenever operators left staging zones cluttered.',
        ],
      },
      {
        heading: 'Layered costmap fusion in ROS Navigation',
        paragraphs: [
          'Rather than overriding local velocity commands with brittle hard-stop interrupts, we fused a ring of four front-and-corner ultrasonic transducers into the ROS move_base local costmap via the range_sensor_layer plugin.',
          'Each ultrasonic reading updates probabilistic occupancy cells strictly inside its beam cone and decays cleanly once the robot moves past—preventing phantom obstacles from lingering on the map while still feeding smooth avoidance trajectories to the DWA local planner.',
        ],
        codeSnippet: {
          language: 'yaml',
          caption: 'ROS local_costmap observation layer configuration',
          code: `plugins:
  - { name: obstacle_layer, type: "costmap_2d::ObstacleLayer" }
  - { name: sonar_layer,    type: "range_sensor_layer::RangeSensorLayer" }
  - { name: inflation_layer, type: "costmap_2d::InflationLayer" }

sonar_layer:
  topics: ["/ultrasound/front_left", "/ultrasound/front_right"]
  clear_threshold: 0.2
  mark_threshold: 0.78
  inflate_cone: 0.9`,
        },
      },
      {
        heading: 'Measured impact in aisle trials',
        paragraphs: [
          'Tuning inflation decay and pairing dynamic obstacle clearing with conservative angular velocity limits lowered collision-related intervention events by 30% and raised autonomous run reliability above 98% across multi-shift validation.',
        ],
      },
    ],
  },
  {
    id: 'nlp-descriptive-exam-grading',
    slug: 'evaluating-descriptive-exam-scripts-tfidf-cosine-similarity',
    title: 'Beyond Exact Keywords: Evaluating Descriptive Exam Scripts with TF-IDF & Cosine Similarity',
    category: 'NLP Systems',
    publishedAt: 'May 09, 2026',
    readTime: '5 min read',
    featuredImage: '/src/assets/images/blog_nlp_exam_grading_1795446413995.jpg',
    featuredAlt:
      'Handwritten answer sheets alongside cosine similarity vector diagrams on an engineering desk',
    excerpt:
      'Designing a deterministic, transparent scoring pipeline using morphological stemming, rubric-weighted term vectors, and Flask/Streamlit serving at 50 sheets per minute.',
    keyTakeaways: [
      'Domain-specific stopword filtering keeps technical qualifiers like "unseen" and "memorizes" intact.',
      'Cosine similarity calibrated against an instructor answer key produces explainable term-overlap highlights.',
      'Lightweight sparse vectorization achieves 50 sheets/minute on CPU without heavy transformer cold starts.',
    ],
    sections: [
      {
        heading: 'Why educators need explainable scoring',
        paragraphs: [
          'Grading large cohorts of descriptive university scripts is slow and prone to fatigue-induced variance. Yet black-box neural graders often fail institutional audits when students ask why a specific answer earned 6.5 instead of 8.0.',
          'Our automated answer evaluation pipeline prioritizes auditability: every mark ties directly to vector similarity against the faculty rubric key, paired with visual token-overlap highlighting.',
        ],
      },
      {
        heading: 'Tokenization, stemming, and calibrated thresholds',
        paragraphs: [
          'Raw word matching penalizes valid phrasing variations such as "regularizing" versus "regularization" or "memorizes" versus "memorized". Applying deterministic suffix normalization alongside a domain-curated stopword list aligns conceptually equivalent responses into shared feature dimensions.',
          'Because descriptive student answers are rarely verbatim copies of a model key, linear scaling from raw cosine similarity directly to marks under-scores strong answers. Calibrating full marks at a cosine similarity ceiling of 0.75 yielded an 88% correlation with human faculty scores.',
        ],
        codeSnippet: {
          language: 'python',
          caption: 'Calibrated TF-IDF cosine grading function',
          code: `def score_response(model_key: str, student_text: str, max_marks: float = 10.0) -> float:
    vec = TfidfVectorizer(preprocessor=normalize_stem, stop_words=DOMAIN_STOPWORDS)
    tfidf = vec.fit_transform([model_key, student_text])
    sim = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0])
    calibrated = min(max_marks, round((sim / 0.75) * max_marks, 1))
    return calibrated`,
        },
      },
      {
        heading: 'Deployment at 50 sheets per minute',
        paragraphs: [
          'Wrapped behind a Flask REST service and a Streamlit faculty review dashboard, the grader processes 50 answer scripts per minute on standard CPU hardware—cutting manual grading overhead by 60% while letting instructors inspect flagged edge cases.',
        ],
      },
    ],
  },
  {
    id: 'edge-inference-web-telemetry',
    slug: 'bridging-edge-vision-inference-web-telemetry-logistics',
    title: 'Bridging Edge Inference and Web Telemetry for Logistics Operators',
    category: 'Architecture',
    publishedAt: 'Mar 18, 2026',
    readTime: '4 min read',
    featuredImage: '/src/assets/images/blog_edge_telemetry_arch_1795446414121.jpg',
    featuredAlt:
      'Industrial edge GPU enclosure streaming real-time logistics telemetry to an operator display',
    excerpt:
      'Decoupling camera capture, GPU inference, and operator UI updates with bounded ring buffers so dashboard traffic never stalls the vision loop.',
    keyTakeaways: [
      'Never run model inference inside a synchronous HTTP or UI render thread.',
      'Bounded single-slot frame queues prioritize latest-frame freshness over stale backlog processing.',
      'Batched JSON count deltas keep operator dashboards responsive without saturating factory Wi-Fi.',
    ],
    sections: [
      {
        heading: 'Keeping the camera loop immune to network backpressure',
        paragraphs: [
          'When an edge vision node streams raw annotated frames over unstable warehouse Wi-Fi, naive synchronous architectures stall the camera capture thread whenever a browser client slows down. Within seconds, frame latency climbs from 30ms to several seconds.',
          'Separating frame acquisition, inference, and web telemetry into decoupled worker stages ensures the detector always operates on the freshest available frame.',
        ],
      },
      {
        heading: 'Ring buffers and event-driven alerts',
        paragraphs: [
          'Using a bounded queue of depth 2 with drop-oldest semantics ensures the inference worker never wastes GPU cycles on stale belt positions, keeping effective frame drop rates under 2%.',
          'Meanwhile, the web dashboard subscribes only to compact count increments and threshold warnings—giving floor supervisors instant visibility into jam alerts and shift tallies without streaming uncompressed video everywhere.',
        ],
      },
    ],
  },
];
