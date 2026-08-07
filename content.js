(function () {
  "use strict";

  const teachableCourseUrl = (courseId) =>
    `https://praxiscenterforaestheticstudies.com/courses/enrolled/${courseId}`;

  const course = (id, title) => ({
    id: String(id),
    title,
    url: teachableCourseUrl(id),
  });

  window.PraxisQuizContent = {
    pathOrder: ["gallery", "collector", "funded", "independent"],
    tieBreakQuestionIds: ["q6", "q1"],
    membershipUrl:
      "https://praxiscenterforaestheticstudies.com/p/getting-your-art-into-galleries",
    intro: {
      eyebrow: "A four-minute Praxis assessment",
      title: "What kind of career path is right for you?",
      description:
        "Answer seven questions to identify your career path and get a sequenced Praxis course roadmap.",
    },
    questions: [
      {
        id: "q1",
        weight: 3,
        prompt: "When my art career feels stuck, what usually seems to be missing?",
        answers: [
          {
            path: "gallery",
            label: "I need stronger connections to professional art spaces.",
          },
          {
            path: "independent",
            label: "I need more consistency, visibility, or momentum.",
          },
          {
            path: "funded",
            label: "I need resources to realize a specific idea.",
          },
          {
            path: "collector",
            label: "I need more people seeing and buying my work.",
          },
        ],
      },
      {
        id: "q2",
        weight: 2,
        prompt: "Which part of developing my career feels most natural?",
        answers: [
          {
            path: "independent",
            label: "Experimenting, sharing, and creating my own opportunities.",
          },
          {
            path: "gallery",
            label: "Presenting a cohesive body of work.",
          },
          {
            path: "collector",
            label: "Talking with individuals about my work.",
          },
          {
            path: "funded",
            label: "Explaining why an idea or project matters.",
          },
        ],
      },
      {
        id: "q3",
        weight: 1,
        prompt: "Which task sounds most manageable to repeat each week?",
        answers: [
          {
            path: "collector",
            label: "Sharing my work and following up with interested people.",
          },
          {
            path: "funded",
            label: "Developing a proposal, budget, or request for support.",
          },
          {
            path: "gallery",
            label: "Researching relevant galleries and arts organizations.",
          },
          {
            path: "independent",
            label: "Publishing, organizing, or collaborating.",
          },
        ],
      },
      {
        id: "q4",
        weight: 2,
        prompt: "What foundation is strongest in my practice?",
        answers: [
          {
            path: "funded",
            label: "A defined project that needs support.",
          },
          {
            path: "independent",
            label: "A distinctive practice or story that is still finding its audience.",
          },
          {
            path: "gallery",
            label: "A cohesive, exhibition-ready body of work.",
          },
          {
            path: "collector",
            label: "Work ready to sell or develop into commissions.",
          },
        ],
      },
      {
        id: "q5",
        weight: 1,
        prompt: "What kind of structure helps me follow through?",
        answers: [
          {
            path: "gallery",
            label: "Deadlines and contact with arts professionals.",
          },
          {
            path: "collector",
            label: "Direct responses from people interested in my work.",
          },
          {
            path: "independent",
            label: "Self-directed experiments and community accountability.",
          },
          {
            path: "funded",
            label: "Project goals and application deadlines.",
          },
        ],
      },
      {
        id: "q6",
        weight: 3,
        prompt: "If the next three months went well, what change would I most like to notice?",
        answers: [
          {
            path: "collector",
            label: "I would receive more inquiries, commissions, or sales.",
          },
          {
            path: "gallery",
            label: "I would have serious conversations or an exhibition invitation.",
          },
          {
            path: "funded",
            label: "A funder or supporter would commit resources to my work.",
          },
          {
            path: "independent",
            label: "I would feel more visible, confident, and consistent.",
          },
        ],
      },
      {
        id: "q7",
        weight: 2,
        prompt: "Which next step currently feels hardest?",
        answers: [
          {
            path: "independent",
            label: "Choosing a clear message and sharing my work regularly.",
          },
          {
            path: "funded",
            label: "Turning an idea into a clear request for support.",
          },
          {
            path: "collector",
            label: "Reaching interested people and presenting my prices.",
          },
          {
            path: "gallery",
            label: "Knowing whom to approach and what to send.",
          },
        ],
      },
    ],
    paths: {
      gallery: {
        title: "Gallery & Institutional Career",
        shortTitle: "Gallery & Institutional",
        accent: "blue",
        videoEmbedUrl: "",
        description:
          "Build sustained relationships with galleries, curators, and arts institutions.",
        why:
          "This path centers on a clear professional presentation, targeted research, direct outreach, and long-term relationships with the people who organize exhibitions and programs.",
        takeaways: [
          "Clarify how you present your work",
          "Build a focused list of institutions and contacts",
          "Turn outreach into ongoing professional relationships",
        ],
        courses: [
          course(105336, "Time Management for Artists"),
          course(41471, "Writing Statements, Bios, and Press Releases"),
          course(535399, "Getting Into Galleries"),
          course(1010299, "Roundtable Meeting Recordings"),
          course(426637, "International Recognition for Artists"),
        ],
      },
      collector: {
        title: "Collector-Led Studio",
        shortTitle: "Collector-Led Studio",
        accent: "red",
        videoEmbedUrl: "",
        description:
          "Build direct relationships between your studio practice and the people who want to collect your work.",
        why:
          "This path combines a consistent public presence, clear offers, and regular follow-up to turn interest in the work into purchases and commissions.",
        takeaways: [
          "Create a consistent public presence",
          "Make it easy for interested people to stay connected",
          "Develop a confident, repeatable sales process",
        ],
        courses: [
          course(105336, "Time Management for Artists"),
          course(41525, "Social Media Strategy & Web Design for Artists"),
          course(703483, "How to Build an Audience of Collectors"),
          course(123234, "Selling Art Online"),
          course(43348, "Taxes and Art: A Financial Primer"),
        ],
      },
      funded: {
        title: "Funded Project Practice",
        shortTitle: "Funded Projects",
        accent: "amber",
        videoEmbedUrl: "",
        description:
          "Turn a defined artistic idea into a project that funders, patrons, and sponsors can support.",
        why:
          "Grants, patrons, sponsors, and crowdfunding depend on the same foundation: a clear proposal, a realistic plan, a credible budget, and a specific request.",
        takeaways: [
          "Turn the idea into a concrete plan and budget",
          "Tell the project story in language supporters understand",
          "Build several complementary sources of support",
        ],
        courses: [
          course(105336, "Time Management for Artists"),
          course(41471, "Writing Statements, Bios, and Press Releases"),
          course(43347, "Grants & How to Write Them"),
          course(43344, "Patrons & Sponsors for Artists"),
          course(36856, "Kickstarter School for Artists"),
          course(814027, "Resources for Artists"),
        ],
      },
      independent: {
        title: "Independent Visibility Practice",
        shortTitle: "Independent Visibility",
        accent: "green",
        videoEmbedUrl: "",
        description:
          "Build public visibility through clear positioning, consistent communication, and self-directed opportunities.",
        why:
          "This path uses a defined public message, consistent publishing, collaboration, and self-produced opportunities to build recognition outside a gallery-first or sales-first model.",
        takeaways: [
          "Define a memorable public story for the work",
          "Build consistency without flattening experimentation",
          "Create opportunities instead of waiting for permission",
        ],
        courses: [
          course(105336, "Time Management for Artists"),
          course(2479820, "The Art World Demystified"),
          course(41471, "Writing Statements, Bios, and Press Releases"),
          course(41525, "Social Media Strategy & Web Design for Artists"),
          course(453899, "Monthly Challenges"),
          course(426637, "International Recognition for Artists"),
        ],
      },
    },
  };
})();
