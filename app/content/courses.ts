export type CourseSource = { title: string; url: string };
export type CourseLesson = {
  id: string; title: string; minutes: number; conceptIds: string[];
  module?: string; figureKey?: string;
  objective: string; paragraphs: string[]; example: { title: string; text: string; code?: string };
  task: string; checklist: string[];
  question: { prompt: string; options: { text: string; correct: boolean; feedback: string }[] };
  sources: CourseSource[];
};
/**
 * Who a course is for, said plainly enough that a visitor can tell in one
 * glance whether it is their problem. `pain` is written in the learner's own
 * voice; `win` names an artifact or a checkable ability, never a feeling.
 */
export type CourseAudience = {
  who: string;
  pain: string;
  win: string;
};
export type Course = {
  slug: string; title: string; summary: string; category: string; outcome: string;
  audience: CourseAudience;
  prerequisite: string; conceptIds: string[]; lessons: CourseLesson[];
};

export const courses: Course[] = [
  {
    "slug": "vibe-coding-basics",
    "title": "Vibe coding 入门：和 AI 一起做出第一个学习工具",
    "category": "Vibe coding",
    "summary": "不用先学语法：把想法用自己的话交给 AI，一步步做出一个能打开、能练、能改的提示卡学习工具，并看懂它由哪三层组成。",
    "outcome": "一个可在浏览器打开、能解释关键代码的提示卡页面。",
    "audience": {
      "who": "想给自己孩子或自己班做一个小练习页、但从没写过一行代码的家长或老师",
      "pain": "我最清楚我孩子卡在哪一步，可市面上的练习应用全不对路，我自己又做不出来。",
      "win": "一个能在浏览器里打开的提示卡页面，而且你能指着每一段说出它在做什么。"
    },
    "prerequisite": "文本编辑器与浏览器；可选任意 AI 编程工具。无需账号或付费 API。",
    "conceptIds": [],
    "lessons": [
      {
        "id": "first-project",
        "figureKey": "web-layers",
        "title": "AI 编程从一个能检查的小页面开始",
        "module": "从想法到页面",
        "minutes": 15,
        "conceptIds": [],
        "objective": "理解 AI 协助写代码与网页运行时调用 AI 的区别。",
        "paragraphs": [
          "用自然语言让 AI 帮你写程序，仍然需要有人决定要做什么、检查结果并修正问题。AI 可以草拟文件、解释报错与提出实现办法，但它的完成宣告不能代替浏览器里的实际运行。这门课把范围缩到一张阅读提示卡。",
          "网页文件是浏览器读取的材料。你用编辑器修改它，再用浏览器打开，看到文字、布局与按钮行为。AI 帮忙生成过这些文件，不表示网页运行时还在与模型聊天；普通提示展开只需预先写好的内容和几行程序。",
          "准备一个独立文件夹、文本编辑器与浏览器即可开始，可选自己已有的 AI 工具。先用中文写“点击按钮显示一句提示，再次点击收起”，把登录、联网生成与付费服务留到有实际需要时。你将完成的是可解释、可检查的小交互。"
        ],
        "example": {
          "title": "编程助手与产品助手",
          "text": "预测关闭 AI 工具后本地提示卡是否还能工作；打开已有静态页面或纸面流程，指出哪些文字预先写好、哪些行为由点击触发。"
        },
        "task": "建立独立练习目录，写一句用户动作与结果，再列出三项本轮不需要的功能；说明页面是否应联网。",
        "checklist": [
          "目标只有一个主要交互。",
          "能区分生成代码与运行时调用模型。",
          "有独立的文件夹保存练习。"
        ],
        "question": {
          "prompt": "网页由 AI 写成，是否必然每次点击都调用模型？",
          "options": [
            {
              "text": "是，所有动作都依赖模型。",
              "correct": false,
              "feedback": "代码可在浏览器独立执行，取决于实现。"
            },
            {
              "text": "否，要看页面是否实现了模型请求。",
              "correct": true,
              "feedback": "开发方式与产品运行方式是两件事。"
            },
            {
              "text": "只要按钮蓝色就会调用。",
              "correct": false,
              "feedback": "样式不能决定是否联网调用。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · HTML",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax"
          },
          {
            "title": "MDN · JS",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript"
          }
        ]
      },
      {
        "id": "files-preview",
        "figureKey": "web-layers",
        "title": "文件、路径与浏览器预览",
        "module": "从想法到页面",
        "minutes": 15,
        "conceptIds": [],
        "objective": "把正确文件保存成 HTML，并通过可核对的路径打开。",
        "paragraphs": [
          "文件名末尾的 .html 告诉我们它是网页文档。文本编辑器里的标签页是正在编辑的文件，浏览器地址栏则表示当前打开的地址。两者可能不是同一份文件：一个常见问题是改了副本，却一直刷新旧页面。",
          "先在练习目录创建 index.html，输入一个标题并保存，再从编辑器或文件管理器打开它。浏览器显示 file: 开头地址时，是在读本地文件；用本地预览服务时常见 http://localhost 地址，服务把目录内容提供给浏览器。",
          "最小静态页面可以直接打开，涉及模块或稳定存储验证时更适合本地 HTTP 预览。本地服务并不等于公开发布，不要把 localhost 地址发给同事当在线产品。遇到改动不显示，按文件路径、保存、刷新顺序排查，比反复重写代码更有效。"
        ],
        "example": {
          "title": "标题换了，为什么页面没变？",
          "text": "预测修改一个副本会不会影响旧路径页面；给标题加“练习一”并保存，核对地址后刷新，解释编辑位置与预览位置如何对应。"
        },
        "task": "创建 index.html 并显示中文标题，记录文件位置与预览地址；改一个词后确认它出现，删除测试词再保存。",
        "checklist": [
          "文件没有误存成 .html.txt。",
          "编辑与预览指向同一份内容。",
          "知道 localhost 并非公共网址。"
        ],
        "question": {
          "prompt": "保存后页面没变，最先检查？",
          "options": [
            {
              "text": "是否打开了正确文件并刷新。",
              "correct": true,
              "feedback": "先排除路径与保存问题。"
            },
            {
              "text": "立即注册更多 AI 账号。",
              "correct": false,
              "feedback": "新账号不能修复文件路径。"
            },
            {
              "text": "把所有文件删除重建。",
              "correct": false,
              "feedback": "应先定位已有文件与预览的对应关系。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · server",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/set_up_a_local_testing_server"
          },
          {
            "title": "MDN · HTML",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax"
          }
        ]
      },
      {
        "id": "three-layers",
        "title": "页面的三层分别做什么",
        "minutes": 15,
        "conceptIds": [],
        "objective": "区分内容结构、视觉样式与交互行为，并运行最小页面。",
        "paragraphs": [
          "HTML 描述内容结构，如标题、段落、按钮；CSS 控制排版和视觉；JavaScript 响应动作、更新状态。先拆清这三层，遇到问题时就知道该检查哪一层。",
          "把下面代码保存为 index.html，用浏览器打开。点击前写下你的预测：哪个元素会改变？再点击并对照。修改标题和提示文字，观察文字变化是否影响交互。",
          "这个页面不联网，也不调用 AI。AI 可以协助你写代码，但网页运行时是否依赖模型，是另一个设计决定。简单的提示展示不需要模型请求。",
          "这里的 hidden 是元素的隐藏状态，aria-expanded 是向辅助技术说明是否展开的信息。它们都应随着同一次点击更新。把某一层暂时关掉时，观察结构、外观和动作分别损失什么，便能理解三层的分工。"
        ],
        "example": {
          "title": "一个真正可运行的提示卡",
          "text": "代码使用原生 button，键盘也可以激活。lang、字符编码与 viewport 分别帮助声明语言、正确显示中文和适配窄屏。",
          "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>阅读提示卡</title>\n<style>body{max-width:40rem;margin:3rem auto;padding:1rem;font:18px/1.7 sans-serif}button{font:inherit;padding:.6rem}</style>\n<main>\n<h1>这段话的证据在哪里？</h1>\n<p>先写下判断，再按需打开提示。</p>\n<button id=\"toggle\" aria-expanded=\"false\" aria-controls=\"hint\">打开提示</button>\n<p id=\"hint\" hidden>找一句可以支持你判断的原文。</p>\n</main>\n<script>\nconst button = document.querySelector(\"#toggle\");\nconst hint = document.querySelector(\"#hint\");\nbutton.addEventListener(\"click\", () => {\n  hint.hidden = !hint.hidden;\n  button.setAttribute(\"aria-expanded\", String(!hint.hidden));\n  button.textContent = hint.hidden ? \"打开提示\" : \"收起提示\";\n});\n</script>\n</html>"
        },
        "task": "保存并打开页面，改变颜色和文案。然后只用 Tab 与 Enter 操作按钮，解释 hidden 与 aria-expanded 为什么要一起更新。",
        "checklist": [
          "HTML 文件能显示中文。",
          "鼠标与键盘都能切换提示。",
          "我能指出结构、样式与行为各自的位置。"
        ],
        "question": {
          "prompt": "按钮可以点击，但点击后文字不变化，首先检查哪一层？",
          "options": [
            {
              "text": "JavaScript 的事件监听和元素选择。",
              "correct": true,
              "feedback": "先看控制台错误，并确认按钮和提示的 ID 与选择器一致。"
            },
            {
              "text": "立即更换网站配色。",
              "correct": false,
              "feedback": "配色一般不会修复事件处理；先定位行为代码。"
            },
            {
              "text": "先修改 HTML 的 lang 属性。",
              "correct": false,
              "feedback": "语言声明有助阅读与辅助技术，但不会替你绑定点击事件。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · Learn web development",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development"
          },
          {
            "title": "MDN · Adding interactivity",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Adding_interactivity"
          }
        ],
        "module": "从想法到页面",
        "figureKey": "web-layers"
      },
      {
        "id": "html-semantics",
        "figureKey": "web-layers",
        "title": "HTML：给内容起正确的角色",
        "module": "理解三层代码",
        "minutes": 15,
        "conceptIds": [],
        "objective": "用标题、段落、链接与按钮表达页面内容的用途。",
        "paragraphs": [
          "HTML 元素由标签和内容组成，例如 h1 包住主标题，p 包住段落。标签不只是决定默认长什么样，也告诉浏览器和辅助技术这段内容的角色。把一行字加粗，不等于它已经成为有层级的标题。",
          "在阅读活动里，主题用主标题，材料用段落，前往来源用链接，展开提示用按钮。链接有目的地址，按钮执行当前界面的动作。优先使用这些原生元素，会得到很多现成的键盘与浏览器行为，减少自己补写的工作。",
          "属性补充元素信息：id 是页面内用于定位的名称，href 是链接地址，lang 说明文档语言。ID 在同一文档中应唯一。先把没有颜色的结构读顺，再加样式；这样即使样式没加载，学习材料仍有清楚的顺序。"
        ],
        "example": {
          "title": "去掉颜色还能读懂吗？",
          "text": "预测仅凭大小和颜色做的标题能否表达结构；把提示卡暂时去掉 style，检查标题、说明、按钮与来源是否仍可辨认。",
          "code": "<h1>找出支持观点的证据</h1>\n<h2>阅读材料</h2>\n<p>在这里放一段经过检查的短文。</p>\n<a href=\"https://www.w3.org/WAI/\">打开参考资料</a>\n<button type=\"button\">展开提示</button>"
        },
        "task": "给提示卡补一个来源链接和二级标题，检查唯一 ID；只用键盘访问链接与按钮，说明二者动作差别。",
        "checklist": [
          "标题使用真实标题元素。",
          "导航与动作控件用途匹配。",
          "重要内容脱离样式仍能读懂。"
        ],
        "question": {
          "prompt": "“打开参考资料”前往另一网址，优先用？",
          "options": [
            {
              "text": "可点击的普通 div。",
              "correct": false,
              "feedback": "需要额外补行为和语义，原生链接更合适。"
            },
            {
              "text": "带 href 的 a 元素。",
              "correct": true,
              "feedback": "它表达导航，也保留浏览器原生能力。"
            },
            {
              "text": "一张写着地址的图片。",
              "correct": false,
              "feedback": "图片并不能提供可操作的链接入口。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · HTML",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax"
          },
          {
            "title": "W3C WAI · Page Structure",
            "url": "https://www.w3.org/WAI/tutorials/page-structure/"
          }
        ]
      },
      {
        "id": "css-rules",
        "figureKey": "web-layers",
        "title": "CSS：让同一条规则作用到合适内容",
        "module": "理解三层代码",
        "minutes": 15,
        "conceptIds": [],
        "objective": "读懂选择器、属性和值，并定位样式影响的范围。",
        "paragraphs": [
          "CSS 用规则描述元素如何呈现。一条规则先写选择器，说明选中哪些元素，再在花括号里写属性和值。例如 p 选中段落，line-height 调整行高。你不用一次记住所有属性，先能回答这条规则改谁、改什么。",
          "若把 button 的字号调大，页面上的多个按钮可能一起改变；若只想改提示按钮，可以给它一个专用类名。样式表里不同规则也可能同时匹配同一元素，因此后加一行不一定按直觉覆盖，需检查实际生效的规则。",
          "对教师阅读页，优先考虑行宽、字号、间距和清楚的焦点，再选择颜色。不要为解决一个按钮问题直接改所有元素。小步修改一个属性并观察，能把原因和结果连接起来；截图好看仍需用长内容与窄屏检查。"
        ],
        "example": {
          "title": "一条规则影响几个按钮？",
          "text": "先预测 button 与 .hint-button 两个选择器各会选中谁；给页面加两个按钮，只给其中一个类名，再修改边框观察范围。",
          "code": ".hint-button { padding: .6rem 1rem; }\np { line-height: 1.8; max-width: 40rem; }"
        },
        "task": "为提示按钮添加类名，只调整它的内边距；再调正文行高，记录每次改动对应的可见变化。",
        "checklist": [
          "能指出选择器与属性。",
          "知道全局规则可能影响多个元素。",
          "焦点轮廓没有被删除。"
        ],
        "question": {
          "prompt": "只改提示按钮，避免影响其他按钮，应该？",
          "options": [
            {
              "text": "给它明确类名并针对该类写规则。",
              "correct": true,
              "feedback": "选择范围与改动范围一致。"
            },
            {
              "text": "把所有元素的字号都改掉。",
              "correct": false,
              "feedback": "范围过大，容易造成无关变化。"
            },
            {
              "text": "删除其他按钮。",
              "correct": false,
              "feedback": "无需移除功能来缩小样式作用范围。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · CSS",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/What_is_CSS"
          },
          {
            "title": "MDN · box",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model"
          }
        ]
      },
      {
        "id": "js-values",
        "title": "JavaScript：状态变化才带来行为",
        "module": "理解三层代码",
        "minutes": 15,
        "conceptIds": [],
        "objective": "读懂变量、布尔值与点击处理之间的关系。",
        "paragraphs": [
          "JavaScript 能保存当前信息并响应动作。变量是程序里给一个值取的名字，布尔值只有 true 与 false 两种，常用来表示展开还是收起。理解这种状态，比逐字背一整段按钮代码更容易迁移到其他小交互。",
          "事件是浏览器报告发生的事情，例如用户点击按钮。事件处理函数则是事件发生后要做的一组步骤。提示卡每次点击先翻转展开状态，再根据状态更新可见内容、按钮文字和 aria-expanded，让不同使用方式得到一致信息。",
          "如果只改文字却忘了实际隐藏提示，页面会出现相互矛盾的状态。要把“存的值”和“看到的内容”一起检查。刷新后普通变量重新初始化；想跨刷新保留，需要另外设计存储，不是把变量名字叫 saved 就会自动保存。"
        ],
        "example": {
          "title": "两次点击为什么应该回到起点？",
          "text": "预测 closed→open→closed 的每一步按钮文字；点击两次，对照 hidden 和 aria-expanded，再解释状态、视觉与语义为什么要同步。"
        },
        "task": "在已有代码旁写注释：选元素、监听点击、改变状态、更新页面；用两次点击与刷新检查自己的解释。",
        "checklist": [
          "知道 true/false 表示两种状态。",
          "能找到事件处理代码。",
          "不会把临时变量当永久记录。"
        ],
        "question": {
          "prompt": "按钮文字说“已收起”但内容仍在，说明？",
          "options": [
            {
              "text": "程序必然正确，只是用户误解。",
              "correct": false,
              "feedback": "文字与可见状态已经不一致。"
            },
            {
              "text": "应删除按钮文字。",
              "correct": false,
              "feedback": "隐藏问题不能修复状态同步。"
            },
            {
              "text": "需要检查同一次动作是否更新了全部相关显示。",
              "correct": true,
              "feedback": "交互正确性涉及状态及其多个呈现位置。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · events",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events"
          },
          {
            "title": "MDN · DOM",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"
          }
        ],
        "figureKey": "web-layers"
      },
      {
        "id": "brief",
        "figureKey": "web-layers",
        "title": "让 AI 接到可检查的任务",
        "minutes": 12,
        "conceptIds": [],
        "objective": "用情境、范围和验收条件组织一次小改动。",
        "paragraphs": [
          "“做一个更好的学习网站”包含太多未决定的问题。把任务压到一个动作：谁在什么情境下，按哪个按钮，看到什么变化，哪些条件必须满足。",
          "在提示卡例子中，支持需要可请求、可收起。让 AI 一次只改这一段交互，并解释修改的文件和原因。你负责确认学习者是否需要这个支持，AI 的实现建议不自动证明教学合理。",
          "每次改动先留版本，再检查差异和实际行为。如果 AI 添加了你没要求的登录、追踪或第三方服务，让它先说明必要性。小范围工作更容易判断有没有改对。",
          "验收条件就是别人可以照做的检查句子，例如“按第二次按钮时，提示收起”。先在纸上走一遍两级提示，预测每次点击后应出现哪句话，再交给 AI 编写，避免把还没决定的规则留给工具猜。"
        ],
        "example": {
          "title": "可以直接改写的任务描述",
          "text": "“为已有提示卡增加两级提示。第一级只提醒找证据，第二级才展示示例。使用原生按钮，不添加依赖或联网请求。用户可以收起提示。键盘可操作；刷新后恢复初始状态。先说明方案，然后只修改 index.html，并列出我应测试的三个行为。”"
        },
        "task": "根据自己的学习场景改写这份描述。可交给 AI 实现，也可手动修改；无论哪种方式，都先预测行为，再逐项检查。",
        "checklist": [
          "需求包含具体使用者、动作与结果。",
          "提示没有替学习者直接完成全部判断。",
          "我检查了代码差异，而不只看 AI 的总结。"
        ],
        "question": {
          "prompt": "AI 说“已经优化学习效果”，你下一步应该做什么？",
          "options": [
            {
              "text": "把这句话直接写进产品介绍。",
              "correct": false,
              "feedback": "实现报告不能支持教学效果主张。先核对行为，再设计对学习目标的检查。"
            },
            {
              "text": "检查交互是否满足需求，再单独验证学习者表现。",
              "correct": true,
              "feedback": "功能正确和教学有效需要不同的证据。"
            },
            {
              "text": "只看新增了多少行代码。",
              "correct": false,
              "feedback": "改动量不能说明功能是否正确，也不能代替学习表现证据。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · HTML",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax"
          },
          {
            "title": "MDN · events",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events"
          }
        ],
        "module": "与 AI 一起迭代"
      },
      {
        "id": "read-diff",
        "figureKey": "web-layers",
        "title": "让 AI 解释修改，再核对真实文件",
        "module": "与 AI 一起迭代",
        "minutes": 15,
        "conceptIds": [],
        "objective": "检查 AI 的修改范围与实现证据，而不只接受完成总结。",
        "paragraphs": [
          "AI 回答“已完成”时，可能是在描述计划、已写入文件的代码，或自己推测的运行结果。你需要区分这三种情况。让它列出实际修改文件、关键变化和已经执行的检查，再到文件与浏览器里确认。",
          "例如只要求提示可以收起，却发现新增账号系统和第三方脚本，修改范围就扩大了。先读差异，问这些变化是否为当前任务所必需；如果没有明确理由，把本轮目标收回一个交互。依赖是项目借用的外部代码，也会增加理解和维护成本。",
          "不懂某行代码时，可以请 AI 用“输入是什么、会改哪个值、会影响哪里”解释，再用一个具体动作验证。能把预测与观察对上，才逐渐建立自己的判断。无需假装一遍读懂所有代码，但也不要把无法解释的大改动当作自动进步。"
        ],
        "example": {
          "title": "总结与差异对不上",
          "text": "预测“只改按钮文案”应出现几类文件变化；查看实际差异，若出现网络配置或依赖文件，要求说明与本轮目标的关系。"
        },
        "task": "为一次小改动写检查记录：AI 声称、文件实际、浏览器结果各一项；解释一个你亲自验证的因果关系。",
        "checklist": [
          "区分计划、写入与实际测试。",
          "差异范围与需求相符。",
          "未执行的测试明确写未测试。"
        ],
        "question": {
          "prompt": "AI 说通过测试，却没有步骤和输出时应该？",
          "options": [
            {
              "text": "直接把结论当最终验收。",
              "correct": false,
              "feedback": "尚缺可核对的执行证据。"
            },
            {
              "text": "请求具体检查依据并自己走关键路径。",
              "correct": true,
              "feedback": "把声明连接到文件和行为才能验收。"
            },
            {
              "text": "继续增加十个新功能。",
              "correct": false,
              "feedback": "未确认基础行为时扩展范围会更难定位。"
            }
          ]
        },
        "sources": [
          {
            "title": "Git · diff",
            "url": "https://git-scm.com/docs/git-diff"
          },
          {
            "title": "MDN · debug",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript"
          }
        ]
      },
      {
        "id": "debug",
        "figureKey": "refactor",
        "title": "把“坏了”变成可复现的问题",
        "minutes": 15,
        "conceptIds": [],
        "objective": "用步骤、期望与实际结果描述问题，完成一次回归检查。",
        "paragraphs": [
          "报告问题时保留最短复现步骤。例如“打开页面 → 用 Tab 聚焦按钮 → 按 Enter；期望出现提示，实际没有变化”。同时记录浏览器、窗口宽度和控制台中第一条相关错误。",
          "如果按钮标签变了但提示没出现，检查隐藏属性与样式；如果什么都没发生，检查脚本是否执行和元素是否找到。一次只改变一个原因，避免把新问题混进来。",
          "修好后重测之前正常的行为：首次打开、重复点击、收起、窄屏、键盘。能跑起来是开始，能说明怎么验证过，才方便继续迭代。",
          "控制台是浏览器展示脚本消息和错误的区域，可从开发者工具打开。错误常包含位置与原因，但应从第一条相关信息开始，先确认元素名称与实际页面对应，不必看见红字就整段重写。"
        ],
        "example": {
          "title": "一条清楚的缺陷记录",
          "text": "环境：桌面浏览器，窗口宽 390px。\n步骤：打开页面，连续点“打开提示”两次。\n期望：第二次收起，按钮恢复“打开提示”。\n实际：文字恢复，但提示仍可见。\n检查：第二次点击后查看 hidden 值，核对 CSS 是否覆盖隐藏效果。"
        },
        "task": "在练习副本里把脚本的 #hint 暂时改成 #hint-typo，观察并记录控制台错误，再修回。最后运行你的五项检查，留下结果。",
        "checklist": [
          "问题记录包含期望和实际结果。",
          "修复后重测首次使用与重复操作。",
          "页面在窄屏下没有横向挤出。"
        ],
        "question": {
          "prompt": "为什么修复一个按钮后还要测试收起和重复点击？",
          "options": [
            {
              "text": "因为同一次修改可能影响共享状态。",
              "correct": true,
              "feedback": "对。回归检查覆盖已有行为，避免只验证刚修好的单一步骤。"
            },
            {
              "text": "只要第一次成功，后续状态一定正确。",
              "correct": false,
              "feedback": "交互包含不同状态，首次成功不代表每次切换都正确。"
            },
            {
              "text": "只有上线以后才需要检查重复点击。",
              "correct": false,
              "feedback": "本地就能发现状态问题，越早检查越容易限定原因。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · Learn web development",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development"
          }
        ],
        "module": "与 AI 一起迭代"
      },
      {
        "id": "deliver-small-page",
        "figureKey": "web-layers",
        "title": "交付一个别人能重现的提示卡",
        "module": "与 AI 一起迭代",
        "minutes": 15,
        "conceptIds": [],
        "objective": "整理运行说明、验收结果与限制，完成第一个网页闭环。",
        "paragraphs": [
          "完成网页不只是把文件发出去。接手者需要知道打开哪个文件、怎样看到主要行为、有哪些已知限制。把这些写进 README，比让同事从聊天记录里找最后一段代码更可靠，也方便以后自己继续修改。",
          "准备一份验收表：首次打开提示隐藏；点击出现；再点收起；键盘可操作；窄屏文字可读。每条写实际结果，不要预先全打勾。若只是直接打开文件运行，也说明当前没有账号、上传和模型请求，不暗示服务已上线。",
          "保存一个已检查的版本，并记录仍想做但本轮未做的功能。下一步可以进入互动网页课处理表单与存储，或进入首页课组织入口。把小作品做到能解释、能运行、能复查，已经建立了之后复杂项目所需的工作方式。"
        ],
        "example": {
          "title": "交给明天的自己",
          "text": "预测只拿文件夹还能否在一分钟内启动；关掉当前页面，按 README 从头打开并走验收，解释说明缺了哪一步。"
        },
        "task": "交付 index.html、README 和五项实际验收记录；重新从说明启动一次，修正文档里与页面不一致的地方。",
        "checklist": [
          "说明能从零启动到主要交互。",
          "五项检查写了真实结果。",
          "功能边界与后续计划分开。"
        ],
        "question": {
          "prompt": "最可靠的小作品交付包含什么？",
          "options": [
            {
              "text": "一句“AI 说已完成”。",
              "correct": false,
              "feedback": "缺文件入口与行为证据。"
            },
            {
              "text": "只有漂亮截图。",
              "correct": false,
              "feedback": "截图只能展示某一时刻的外观，无法证明点击和收起都能运行。"
            },
            {
              "text": "运行文件、启动说明、检查结果和限制。",
              "correct": true,
              "feedback": "它让别人能够独立验证与继续维护。"
            }
          ]
        },
        "sources": [
          {
            "title": "W3C WAI · Easy Checks",
            "url": "https://www.w3.org/WAI/test-evaluate/easy-checks/"
          },
          {
            "title": "MDN · HTML",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax"
          }
        ]
      }
    ]
  },
  {
    "slug": "learning-sciences-starter",
    "title": "把学习科学变成设计判断",
    "category": "Learning Sciences",
    "summary": "从学习科学是什么开始，理解回想、间隔、示范、反馈与迁移，把一个教学活动改成有证据可检查的产品流程。",
    "outcome": "一页活动设计、具体练习与反馈，以及延后检查和下一轮改进记录。",
    "audience": {
      "who": "带着一个班、教案已经写熟，却说不清学生到底学会没有的老师",
      "pain": "我讲得很清楚，学生当场也点头说懂了，一到考试还是不会。",
      "win": "一页写下来的活动设计：练什么、怎么给反馈、隔几天用哪道题再查一次。"
    },
    "prerequisite": "无需编程。带来一个你熟悉的教学主题，纸笔即可。",
    "conceptIds": [
      "pedagogy:retrieval-practice",
      "pedagogy:worked-examples-fading",
      "pedagogy:actionable-feedback",
      "pedagogy:spacing",
      "pedagogy:cognitive-load-theory",
      "pedagogy:self-explanation",
      "pedagogy:metacognitive-calibration",
      "pedagogy:interleaving-discrimination",
      "pedagogy:transfer-bridging"
    ],
    "lessons": [
      {
        "id": "what-is-learning-science",
        "figureKey": "retrieval",
        "title": "学习科学如何帮助你做出好产品",
        "module": "看清学习",
        "minutes": 15,
        "conceptIds": [],
        "objective": "区分好用、喜欢和学会，说明学习科学能帮助做出的设计判断。",
        "paragraphs": [
          "学习科学研究人如何获得、理解、保持和使用知识，也研究课堂、工具与社会互动怎样影响这个过程。它结合心理学、教育研究等视角。对做教育产品的老师来说，价值是把“这个功能看起来不错”变成“它让学习者做了什么，为什么可能有帮助，怎样检查”。",
          "例如两个背词页面都很漂亮：一个不断播放词义，另一个先遮住解释，请学习者回想，再核对。它们提供的学习活动不同，不能只用点击次数判断优劣。你需要先确定目标是认得词、写出词，还是在新句子里使用词，再选择检查方法。",
          "研究提供可参考的机制与适用条件，不会替某个新产品自动背书。一个好产品还需要能打开、能理解、能完成任务。学完本课程，你会用目标、练习、支持、反馈和延后检查串起小活动，并明确哪些观察还不能支持效果结论。"
        ],
        "example": {
          "title": "两张词卡，哪张留下证据？",
          "text": "预测：看过词义与遮住词义后自己解释，哪一种更容易暴露不会的地方？尝试各做两张纸卡，记录漏掉的内容。解释差别来自回答要求，而不是卡片颜色。这个小体验不证明长期效果。"
        },
        "task": "选一个你想做的教育工具，分别写“用户操作”“目标表现”“检查时间”；用两种纸面流程试做，解释各自留下什么证据。",
        "checklist": [
          "能用日常语言解释领域关注的问题。",
          "没有把喜欢或点击当作掌握。",
          "能说出一个需要后续验证的产品假设。"
        ],
        "question": {
          "prompt": "一个工具有很多人连续打卡，接下来怎样判断它是否帮助学会？",
          "options": [
            {
              "text": "看打卡数量就够了。",
              "correct": false,
              "feedback": "打卡反映参与，尚未显示目标知识是否能独立使用。"
            },
            {
              "text": "安排与目标对应的独立任务，并在稍后再次检查。",
              "correct": true,
              "feedback": "表现和时间都与学习目标有关，仍需谨慎解释因果。"
            },
            {
              "text": "把按钮换成更醒目的颜色。",
              "correct": false,
              "feedback": "颜色可能改善操作，却不能代替对学习表现的检查。"
            }
          ]
        },
        "sources": [
          {
            "title": "How People Learn II",
            "url": "https://doi.org/10.17226/24783"
          }
        ]
      },
      {
        "id": "prior-knowledge",
        "figureKey": "retrieval",
        "title": "先弄清学习者已经知道什么",
        "module": "看清学习",
        "minutes": 15,
        "conceptIds": [],
        "objective": "用一道起点任务识别知识缺口，避免把新手卡住误判为不认真。",
        "paragraphs": [
          "新知识需要和已有知识连接。老师说“找出论据”时，熟悉写作的人知道要找支持主张的材料；初学者可能连“主张”和“例子”都分不清。同一页对两个人的难度不同，不能只根据年级或自报熟练度安排支持。",
          "起点检查不是入学考试。给一小段材料，请学习者圈出作者要你相信的结论，再说哪句话支持它。你观察的是他采用的判断方法。答错时继续追问理由，才能分辨是词语不懂、材料没读懂，还是把所有数字都当成证据。",
          "据此准备两种入口：已经能说明理由的人直接尝试新例子；还分不清的人先看一句带解释的示范。入口应允许切换，避免一次作答变成固定能力标签。产品里保存所需支持比显示“差生模式”更有用，也更方便后续修正判断。"
        ],
        "example": {
          "title": "同一段材料，两个卡点",
          "text": "预测：不认识“论据”和相信“有数字就可信”，会需要同一种提示吗？分别扮演两位学生做题，再比较词语解释与来源追问的作用。"
        },
        "task": "写一道两分钟起点题，列出两种可能错误及不同帮助；试用后补一句证据不足时如何继续询问。",
        "checklist": [
          "题目检查了本课必需的前提。",
          "错误与帮助有具体对应。",
          "学习者可以离开或重新进入支持路径。"
        ],
        "question": {
          "prompt": "学生把一句含数字的广告当作证据，首先应该？",
          "options": [
            {
              "text": "直接增加十道同类题。",
              "correct": false,
              "feedback": "重复题目前需知道判断错误的原因。"
            },
            {
              "text": "固定标为低能力。",
              "correct": false,
              "feedback": "一次表现不足以给人稳定标签。"
            },
            {
              "text": "请他说明为什么相信这个数字。",
              "correct": true,
              "feedback": "理由能帮助区分来源判断与术语理解问题。"
            }
          ]
        },
        "sources": [
          {
            "title": "How People Learn II",
            "url": "https://doi.org/10.17226/24783"
          }
        ]
      },
      {
        "id": "retrieve",
        "title": "先确定要留下什么证据",
        "minutes": 12,
        "conceptIds": [
          "pedagogy:retrieval-practice"
        ],
        "objective": "把“看懂了”改成一个可以观察的学习表现。",
        "paragraphs": [
          "“学会辨认事实与观点”比“读完这一页”更接近学习目标，但还不够具体。加上任务和条件：面对三句陌生陈述，学习者能判断哪些需要查证，并说明理由。你才能据此设计练习。",
          "提取练习让学习者尝试从记忆中产生答案。重新阅读与主动回忆做的是不同的事。先尝试、再核对，能让不确定的地方显现；题目要符合已有基础，核对后也要允许修正。",
          "一次答对不证明已经长期学会。你可以安排稍后再做一道不同表面的题，观察是否还能说明理由。这里提出的是检查设计，不是对某个工具教学效果的保证。"
        ],
        "example": {
          "title": "把阅读完成率换成学习证据",
          "text": "原活动：读完“事实与观点”的解释后点“我懂了”。\n改造：暂时收起解释，请判断“这条街种了 12 棵树”和“这条街最美”分别如何查证；写出理由，再打开解释比较。"
        },
        "task": "先预测“重读解释”和“遮住解释回答”会留下什么不同证据。为自己的主题写一句可观察目标和一道不能复制原话回答的题，实际尝试后解释遗漏内容如何影响下一次练习。",
        "checklist": [
          "目标说明了学习者要做的动作。",
          "学习者在看到答案前有一次独立尝试。",
          "核对后有修正机会，并计划稍后再检查。"
        ],
        "question": {
          "prompt": "哪个证据最能回应“学习者能区分事实与观点”？",
          "options": [
            {
              "text": "他打开解释页三次。",
              "correct": false,
              "feedback": "这是使用记录。还不知道他是否能进行判断。"
            },
            {
              "text": "他给陌生陈述分类，并说明可以怎样查证。",
              "correct": true,
              "feedback": "它直接呈现目标表现。仍需用更多题目和后续观察判断稳定性。"
            },
            {
              "text": "他说页面很容易理解。",
              "correct": false,
              "feedback": "体验反馈有用，但不能替代对学习目标的检查。"
            }
          ]
        },
        "sources": [
          {
            "title": "IES · Organizing Instruction and Study",
            "url": "https://ies.ed.gov/ncee/wwc/PracticeGuide/1"
          },
          {
            "title": "Testing (quizzing) boosts classroom learning: A systematic and meta-analytic review.",
            "url": "https://doi.org/10.1037/bul0000309"
          }
        ],
        "module": "看清学习",
        "figureKey": "retrieval"
      },
      {
        "id": "memory-spacing",
        "figureKey": "retrieval",
        "title": "把复习分开：为什么隔一段时间再想",
        "module": "安排练习",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:spacing"
        ],
        "objective": "安排有核对的延后回想，理解间隔是设计变量而非神奇日历。",
        "paragraphs": [
          "今天连续解释三次很顺，不代表下周还能解释。间隔练习把接触同一知识的机会分散到不同时间，让学习者在部分遗忘后再次回想。它关心的是未来能否取出知识，因此检查也要离开刚学完的时刻。",
          "为“事实与观点”安排今天学习、明天回想、几天后用新句子判断，是一个可试的起点，并非适合所有人的最佳时间表。内容难度、原有知识以及需要保持多久都会影响安排。答不出来时给线索并核对，不能让错误反复保留下来。",
          "产品可以记录练习日期与错在哪里，帮助老师调整下次任务。不要把倒计时到点当成已经学习，也不要因错过一天清空全部进度。保持总练习量相近时比较不同安排，才更容易讨论间隔本身；一次个人体验仍不能测出普遍效果。"
        ],
        "example": {
          "title": "同样六次，时间如何分配？",
          "text": "先预测一天做六次和三天各做两次哪个更容易在最后一天显得顺手；画出两条时间线。再说明为什么即时顺手和一周后保留是不同问题，不使用虚构记忆曲线。"
        },
        "task": "把三次练习放进一周日历，每次注明题目、核对办法及答不出时的支持；到期记录真实表现，不预填分数。",
        "checklist": [
          "复习要求产生答案而非只打开材料。",
          "安排了延后检查。",
          "日程被说明为可调整的尝试。"
        ],
        "question": {
          "prompt": "复习提醒按时弹出，能说明什么？",
          "options": [
            {
              "text": "说明知识已巩固。",
              "correct": false,
              "feedback": "通知送达还没有学习者的回答。"
            },
            {
              "text": "说明安排触发了，仍需观察回想与核对。",
              "correct": true,
              "feedback": "区分系统事件和学习活动才能读懂记录。"
            },
            {
              "text": "说明必须立即提高难度。",
              "correct": false,
              "feedback": "难度应根据表现与目标调整，不能由时钟决定。"
            }
          ]
        },
        "sources": [
          {
            "title": "Distributed practice in verbal recall tasks: A review and quantitative synthesis.",
            "url": "https://doi.org/10.1037/0033-2909.132.3.354"
          }
        ]
      },
      {
        "id": "scaffold",
        "title": "先给一个例子，再逐步放手",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:worked-examples-fading"
        ],
        "objective": "安排完整示例、部分支持与独立尝试，避免一直替学习者做决定。",
        "paragraphs": [
          "新手可能同时卡在任务规则、操作步骤和学科内容上。一个讲清理由的完整示例，可以展示从问题到判断的过程。示例不仅是标准答案，还要让关键决策可见。",
          "随后减少支持：先留下一个步骤让学习者补充，再换一道题独立尝试。支持不应按固定点击次数机械消失，要看学习者当前是否能继续。如果还卡住，提供较小提示；如果已经熟练，避免重复解释。",
          "这里采用“先看完整范例，再逐步撤去支持”的安排。它并不意味着所有问题都应先展示完整答案；任务类型、已有知识以及是否需要探索，都会影响顺序。支架是临时帮助，不是永久替学习者做决定。",
          "交互图换用分数比较演示同一机制：零级不提供提示，之后依次显示比较方向、部分步骤与完整示例。先预测减少提示后需要自己补哪一步，再切换支持程度。图中的等级只是支持量，不是学习者能力测验。"
        ],
        "example": {
          "title": "同一个目标，三个支持程度",
          "text": "① 示范：“种了 12 棵树”可通过计数核对，因此是可查证陈述。\n② 补全：“这条街很安静”可能与什么条件有关？补充一个判断理由。\n③ 独立：面对新句子，自选查证方法，页面不先给类别。"
        },
        "task": "先预测减少完整步骤后，学习者必须自己做哪个判断。把题扩展成完整范例、补一步、独立尝试三阶段，实际演练并解释每阶段撤去什么，以及何时应加回提示。",
        "checklist": [
          "示例展示了判断理由，不只有结论。",
          "每次减少的支持明确且幅度可控。",
          "最后一步有独立判断，也允许重新求助。"
        ],
        "question": {
          "prompt": "哪个调整更能帮助你判断学习者是否已经独立完成？",
          "options": [
            {
              "text": "每一道题旁边都保留同样的完整答案。",
              "correct": false,
              "feedback": "这样容易把复制示例误当成独立判断。"
            },
            {
              "text": "换一道新题，先不给完整步骤；需要时可请求提示。",
              "correct": true,
              "feedback": "能够观察独立尝试，并保留支持。记得记录是否使用了提示。"
            },
            {
              "text": "第三次点击后永久禁用提示。",
              "correct": false,
              "feedback": "点击次数不代表准备程度；机械撤去支持可能让任务无法继续。"
            }
          ]
        },
        "sources": [
          {
            "title": "IES · Organizing Instruction and Study",
            "url": "https://ies.ed.gov/ncee/wwc/PracticeGuide/1"
          },
          {
            "title": "A Meta-analysis of the Worked Examples Effect on Mathematics Performance",
            "url": "https://doi.org/10.1007/s10648-023-09745-1"
          }
        ],
        "module": "安排练习",
        "figureKey": "scaffolding"
      },
      {
        "id": "manageable-load",
        "figureKey": "retrieval",
        "title": "把不必要的找路负担减下来",
        "module": "安排练习",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:cognitive-load-theory"
        ],
        "objective": "识别任务需要的思考与界面额外造成的记忆负担。",
        "paragraphs": [
          "工作记忆是眼前暂时保留、处理信息的能力。新手一边记操作步骤、一边找说明、一边理解新概念，容易漏掉其中一项。认知负荷理论提醒设计者注意这种同时处理的要求，但它不意味着学习越轻松越好。",
          "在分数比较活动里，让学生判断大小是要保留的思考；让他记住上一屏分子、翻页找分母，则可能是额外负担。把需要比较的量放在同一处，可以减少来回找信息。已经熟练的人却可能不需要每一步都展开，因此支持要能收起。",
          "你可以记录哪里需要翻页、哪里忘了条件，作为改版线索；这些记录不是脑内负荷的直接测量。减少装饰或合并说明以后，还要检查目标任务是否完成得更好。若只是把答案提前显示，虽然更省力，却可能把应该发生的判断也拿走。"
        ],
        "example": {
          "title": "把两个分数放近一点",
          "text": "预测：跨两屏比较与同屏比较，哪种更需要记住中间信息？用纸遮挡模拟两版，记录找回数字的次数，再解释哪些步骤减少了、哪些数学判断仍保留。"
        },
        "task": "画出一个跨屏任务，把必要材料放近；写出保留的核心挑战和减少的一项找路动作。",
        "checklist": [
          "没有把所有困难都当坏事。",
          "调整指向具体信息处理要求。",
          "没有把主观轻松直接当效果证明。"
        ],
        "question": {
          "prompt": "哪项改动最符合本课思路？",
          "options": [
            {
              "text": "把分数答案永久放在题目旁。",
              "correct": false,
              "feedback": "它可能直接取消了需要练习的判断。"
            },
            {
              "text": "删掉所有复杂题。",
              "correct": false,
              "feedback": "适当挑战可能正是目标，不能一概删除。"
            },
            {
              "text": "把比较所需的两个分数放在同一屏。",
              "correct": true,
              "feedback": "减少记住跨屏信息的负担，同时保留大小判断。"
            }
          ]
        },
        "sources": [
          {
            "title": "Cognitive Architecture and Instructional Design: 20 Years Later",
            "url": "https://doi.org/10.1007/s10648-019-09465-5"
          }
        ]
      },
      {
        "id": "explain-a-step",
        "figureKey": "retrieval",
        "title": "让解释指向一个决定",
        "module": "安排练习",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:self-explanation"
        ],
        "objective": "把“说说你的想法”改成能检查推理连接的问题。",
        "paragraphs": [
          "自我解释是学习者说明某一步为什么成立，或它怎样连接到已有知识。它不同于把教师的话重复一遍，也不要求每次写长篇心得。一个准确的小问题能让原来隐藏的判断过程变得可讨论。",
          "学习平均数时，只问“答案多少”看不到学生为什么把总量除以人数。可以追问：“如果每个人分到一样多，除法在这里表示什么？”请学生用分糖果的图和一句话对应。若解释错误，教师仍要纠正，不能因为字数多就认定理解深。",
          "提示应围绕当前最关键的一步，并给初学者词语或示例支持。每个按钮后都强制写反思，会让练习被文字负担淹没。产品可以保留原解释与修正，供比较；它不应把自动字数统计当成推理质量分数。"
        ],
        "example": {
          "title": "一句理由比十句感想更可查",
          "text": "先预测“我学到了很多”和“总数不变，人数加倍，每人所得减半”哪个能检查理解。拿十二枚纸片分别分给三人和六人，再解释除法中的变化。"
        },
        "task": "为自己的例题圈出一个关键决定，写一道“为什么这一步可行”的问题，并写一条错误解释的纠正提示。",
        "checklist": [
          "问题指向具体关系。",
          "答案可以用例子或操作核对。",
          "没有用篇幅代替理解质量。"
        ],
        "question": {
          "prompt": "哪种记录最能帮助检查分配理解？",
          "options": [
            {
              "text": "说明人数改变时每份如何变化并给理由。",
              "correct": true,
              "feedback": "理由连接了数量关系，可进一步用操作核对。"
            },
            {
              "text": "写满两百字心得。",
              "correct": false,
              "feedback": "长度无法保证解释了关键关系。"
            },
            {
              "text": "把题目标题抄一遍。",
              "correct": false,
              "feedback": "重复标题没有呈现判断过程。"
            }
          ]
        },
        "sources": [
          {
            "title": "The ICAP Framework: Linking Cognitive Engagement to Active Learning Outcomes",
            "url": "https://doi.org/10.1080/00461520.2014.965823"
          },
          {
            "title": "How People Learn II",
            "url": "https://doi.org/10.17226/24783"
          }
        ]
      },
      {
        "id": "feedback",
        "title": "反馈要让下一次尝试发生",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:actionable-feedback"
        ],
        "objective": "把评价改写成可以执行的下一步，并给学习者修改机会。",
        "paragraphs": [
          "“不对，再想想”没有告诉学习者从哪里改。“你真聪明”也没有指向当前任务。可执行的反馈应定位一个差距，并提供与目标有关的下一步。",
          "不要一次列出所有问题。针对这次任务最关键的一个决策，提供足够但不过量的信息，再让学习者修改。修改之后才能观察反馈是否被使用。",
          "在教育产品里，反馈也是一种交互：文字在哪里出现、是否保留原回答、能否比较修改前后，都影响用户能否采取行动。记录改动与理由，比只记录“反馈已读”更有解释力。",
          "配套图以分数错误回答演示反馈选择：只说“不对”与指出比较单位、要求重新画等份，留下的下一步不同。改变反馈后先预测学习者能做什么，再尝试修改。图只展示预写路径，不能自动判断真实学习者是否理解。"
        ],
        "example": {
          "title": "从判分到行动",
          "text": "较弱：“回答错误，事实是可以验证的。”\n可行动：“你把‘最美’当成可计数的事实了。请写出两个人可能采用的不同标准，再判断他们是否必须得出相同结论。”\n下一步：保留原回答，让学习者修改并解释改动。"
        },
        "task": "先预测“不对，再想想”和具体下一步各会引出什么动作，再对同一错误回答分别尝试。写出修改前后答案及理由，解释反馈怎样被用上，最后整理目标、练习、支持、反馈和复测。",
        "checklist": [
          "反馈指出具体差距，语气针对任务而非个人。",
          "下一步动作可执行，没有直接包办全部思考。",
          "有修改机会和新的检查题。"
        ],
        "question": {
          "prompt": "收到反馈后，什么记录最有助于判断反馈是否被用上？",
          "options": [
            {
              "text": "反馈框停留了 30 秒。",
              "correct": false,
              "feedback": "停留时间不能说明反馈被怎样理解和使用。"
            },
            {
              "text": "原回答、修改后回答，以及修改理由。",
              "correct": true,
              "feedback": "它们帮助你看见行动变化；仍应检查理由与目标是否一致。"
            },
            {
              "text": "页面自动加一颗星。",
              "correct": false,
              "feedback": "奖励是界面反应，并不是学习者采取行动的证据。"
            }
          ]
        },
        "sources": [
          {
            "title": "EEF · Teacher Feedback to Improve Pupil Learning",
            "url": "https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/feedback"
          },
          {
            "title": "The Power of Feedback Revisited: A Meta-Analysis of Educational Feedback Research",
            "url": "https://doi.org/10.3389/fpsyg.2019.03087"
          }
        ],
        "module": "检查与改进",
        "figureKey": "feedback"
      },
      {
        "id": "confidence-evidence",
        "figureKey": "retrieval",
        "title": "把“我会了”与实际表现对照",
        "module": "检查与改进",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:metacognitive-calibration"
        ],
        "objective": "用预测与表现差距决定下一步练习，而非给人贴自信程度标签。",
        "paragraphs": [
          "元认知是对自己学习过程的认识与调节。校准则是把“我觉得能做到”与“实际做到了什么”对照。熟悉页面、刚看过答案，都可能让人高估自己能独立回答的程度，所以需要外部表现作为参照。",
          "例如先预测三道证据判断题能解释清楚几道，再关掉材料作答，用事先写好的要点核对。若预计三道、实际只能解释一道，应检查漏的是概念还是证据寻找方法。数字不是评价人的自信好坏，而是帮助选择接下来的活动。",
          "对照以后要有行动：重新看一个示范、求助、换一道题，或者稍后再试。只画信心曲线而不给具体策略，很难帮助新手。自评也不能直接转为系统的能力等级；尤其在教育助手里，必须标明哪些来自本人判断、哪些有实际作答支持。"
        ],
        "example": {
          "title": "三题之前先预测",
          "text": "先写预计能解释几题，再独立完成并按理由核对；用两列展示预期与结果。解释一个差距及对应练法，不把示例数字当真实学习数据。"
        },
        "task": "用三道自己的题做一次预测—作答—核对，挑一个差距写出具体下次行动。",
        "checklist": [
          "预测在看答案前完成。",
          "核对依据明确的内容要点。",
          "差距连接到一项可执行调整。"
        ],
        "question": {
          "prompt": "预测全会、核对发现漏掉关键理由时，更合适的是？",
          "options": [
            {
              "text": "提高自评分数以保持动力。",
              "correct": false,
              "feedback": "掩盖差距不能帮助选择练习。"
            },
            {
              "text": "针对漏掉的理由看示范后再试新题。",
              "correct": true,
              "feedback": "用表现调整策略，才完成监控与调节的循环。"
            },
            {
              "text": "让系统永久降低能力标签。",
              "correct": false,
              "feedback": "一次差距不足以定义稳定能力。"
            }
          ]
        },
        "sources": [
          {
            "title": "Overconfidence produces underachievement: Inaccurate self evaluations undermine students’ learning and retention",
            "url": "https://doi.org/10.1016/j.learninstruc.2011.08.003"
          }
        ]
      },
      {
        "id": "compare-cases",
        "figureKey": "retrieval",
        "title": "相似题混在一起，练习选择方法",
        "module": "检查与改进",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:interleaving-discrimination"
        ],
        "objective": "说明混合练习怎样要求辨别，并保留必要的基础教学。",
        "paragraphs": [
          "连续做同一类题时，题目顺序已经提示了方法。交错练习把容易混淆的类型放在一起，让学习者先判断该用哪个概念或步骤。例如面积与周长交替出现，学生不能仅凭上一题继续套同一公式。",
          "交错不是随机把所有知识混成一团。学习者需要先理解基本方法，材料之间也应有值得区分的特征。可以从两种类型开始，每次问“哪一个条件让我选这个方法”，再逐渐减少提示。遇到全都不会的情况，应补前提知识。",
          "混合后当场更慢，不一定说明设计失败；同样，更难也不自动证明有效。研究效果随学科、材料相似程度和安排变化。产品应同时观察方法选择、计算过程和延后表现，避免只凭即时正确率决定取消或扩大混合。"
        ],
        "example": {
          "title": "围篱笆还是铺草皮？",
          "text": "预测同样写着“长六米、宽四米”的两道题是否都应相乘；再按围边与覆盖内部分类，解释任务要求怎样决定方法。"
        },
        "task": "写四张题卡，含两类易混任务；先分组再混合，记录选方法的理由和一条仍需解释的差异。",
        "checklist": [
          "混合的类型有明确可比较特征。",
          "学生有基础方法可用。",
          "检查了方法选择而不只有答案。"
        ],
        "question": {
          "prompt": "交错练习最直接增加的要求是什么？",
          "options": [
            {
              "text": "每题都用上一题的方法。",
              "correct": false,
              "feedback": "交错正是要减少靠顺序猜方法。"
            },
            {
              "text": "在多种方法中判断当前该用哪一种。",
              "correct": true,
              "feedback": "可辨别的条件与方法选择是核心。"
            },
            {
              "text": "把所有学科无规则混合。",
              "correct": false,
              "feedback": "无关材料的混杂不等于有目的的交错。"
            }
          ]
        },
        "sources": [
          {
            "title": "Similarity matters: A meta-analysis of interleaved learning and its moderators.",
            "url": "https://doi.org/10.1037/bul0000209"
          }
        ]
      },
      {
        "id": "transfer",
        "figureKey": "retrieval",
        "title": "换了故事，还能认出同一个关系吗",
        "module": "检查与改进",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:transfer-bridging"
        ],
        "objective": "设计表面不同但关键结构相同的新任务，谨慎解释迁移。",
        "paragraphs": [
          "迁移是把学过的知识用于不同情境。学生在街道例子里能区分事实与观点，到了短视频广告中未必能主动使用同一判断方法。复述原例题证明了某种记忆，却没有完整回答知识能否带到新地方。",
          "设计迁移题时，先明确要保持的关系，例如“陈述能否按公开方法查证”，再改变材料表面，如主题、表达方式或呈现媒介。让学生对照两个案例，说出哪些细节变了、哪个判断标准没变，而不是只把人名替换一下。",
          "初次迁移可以提醒方法，随后需要在没有明显提示的任务中检查是否主动使用。难度应逐步增加，不能突然跳到需要大量陌生知识的领域，再把失败全部归因于不会迁移。一次跨情境成功也只支持该情境下的表现，不等于通用思维能力。"
        ],
        "example": {
          "title": "从街道评价到商品广告",
          "text": "先预测“这款水杯最好”和“容量五百毫升”各需什么查证方式，再与街道例子配对；解释不变的是判断标准，变化的是话题。"
        },
        "task": "把原活动改写到一个新情境，列出不变关系、变化细节和新增前提；安排一次不先提示策略的检查。",
        "checklist": [
          "新题保留了目标关系。",
          "没有偷偷增加大量陌生知识。",
          "报告区分有提示与无提示表现。"
        ],
        "question": {
          "prompt": "把原题换一个人名后答对，最合理的结论是？",
          "options": [
            {
              "text": "已证明所有情境都能运用。",
              "correct": false,
              "feedback": "很小的表面变化不足以支持广泛迁移。"
            },
            {
              "text": "无需再做任何练习。",
              "correct": false,
              "feedback": "保持与主动使用仍未检查。"
            },
            {
              "text": "在这个相近变式中成功，还需新的情境证据。",
              "correct": true,
              "feedback": "结论范围与观察范围一致。"
            }
          ]
        },
        "sources": [
          {
            "title": "When and where do we apply what we learn?: A taxonomy for far transfer.",
            "url": "https://doi.org/10.1037/0033-2909.128.4.612"
          }
        ]
      },
      {
        "id": "design-review",
        "figureKey": "retrieval",
        "title": "交付一份有证据边界的活动设计",
        "module": "检查与改进",
        "minutes": 15,
        "conceptIds": [],
        "objective": "把机制、实施与检查写在一页中，并用观察修订产品。",
        "paragraphs": [
          "设计评审不是给页面贴上越多学习理论越好。你需要说明学习者现在遇到什么困难、准备让他做什么、这个动作为何可能有帮助，以及用什么表现检查。概念名称可以作为索引，不能替代因果解释。",
          "把活动写成一页：目标是独立判断陌生陈述；先做起点题；必要时看示例；再回想判断标准；收到反馈后修改；隔天换材料复测。分别记下界面问题、内容错误和学习困难，因为它们需要不同的修改办法。",
          "请同事走一遍可用性流程，之后再在适当情境收集学习表现。小规模观察可以发现问题，但没有比较条件、足够样本与排除其他解释时，不宜说产品造成了提升。交付时同时写已观察到的变化、尚未回答的问题和下一轮最小改动。"
        ],
        "example": {
          "title": "一个按钮两种证据",
          "text": "预测“能打开提示”与“关掉提示仍能判断”分别检查什么；亲自走两条路径，把结果放进功能与学习两栏。解释为什么两者都需要但不能互代。"
        },
        "task": "完成一页活动设计及一份三栏记录：观察、解释、下一步；选一个最影响目标的问题修改并复查。",
        "checklist": [
          "每个功能对应明确学习动作。",
          "观察与原因推测分开写。",
          "结论没有超出证据支持的范围。"
        ],
        "question": {
          "prompt": "试用后最有用的报告是哪一种？",
          "options": [
            {
              "text": "加入提取练习，所以必然有效。",
              "correct": false,
              "feedback": "研究机制不等于该产品已经验证。"
            },
            {
              "text": "列出观察到的表现、未回答问题和下一轮检查。",
              "correct": true,
              "feedback": "报告让后续设计有依据，也保留结论边界。"
            },
            {
              "text": "只写界面很受欢迎。",
              "correct": false,
              "feedback": "体验是一个维度，还需检查目标表现。"
            }
          ]
        },
        "sources": [
          {
            "title": "How People Learn II",
            "url": "https://doi.org/10.17226/24783"
          },
          {
            "title": "Organizing Instruction and Study to Improve Student Learning (IES Practice Guide)",
            "url": "https://ies.ed.gov/ncee/wwc/PracticeGuide/1"
          }
        ]
      }
    ]
  },
  {
    "slug": "personal-learning-assistant",
    "title": "做一个会帮你回想的学习助手",
    "category": "Learning × Building",
    "summary": "用人工审核的卡片实现回想、核对、反思与下次计划，理解本地记录和规则助手的能力边界。",
    "outcome": "一个使用合成材料的本地练习原型，以及一份检查与扩展计划。",
    "audience": {
      "who": "觉得自己孩子值得一份只为他准备的练习、而不是一套通用题库的家长或自学者",
      "pain": "他错的一直是那几道，可软件还在让他反复做已经会的题。",
      "win": "一个在本地跑起来的练习原型：先作答、再核对、写下一次从哪一题继续。"
    },
    "prerequisite": "完成网页入门；能编辑 HTML 和 JavaScript。先不使用真实学生数据。",
    "conceptIds": [
      "pedagogy:retrieval-practice",
      "pedagogy:metacognitive-calibration",
      "pedagogy:goal-setting-and-implementation-intentions",
      "pedagogy:spacing"
    ],
    "lessons": [
      {
        "id": "learning-loop",
        "title": "先定义助手支持的学习动作",
        "minutes": 12,
        "conceptIds": [
          "pedagogy:retrieval-practice",
          "pedagogy:goal-setting-and-implementation-intentions"
        ],
        "objective": "把“智能助手”缩成一个明确学习循环。",
        "paragraphs": [
          "从“回答任何问题”开始，很难检查助手有没有帮助。先选一个范围：帮助自己回想三条已经学过的概念，核对解释，再写下下一步。材料由你事先审核。",
          "最小循环是“看题 → 独立回答 → 对照参考 → 写出差距 → 安排下一次”。参考解释不能一开始就盖过题目，否则用户容易把读懂误当成自己能够产生答案。",
          "为一次练习设定具体情境，例如晚饭后用五分钟回想两张卡片。这个原型帮助你观察流程，并不自动选择最佳复习间隔，也不诊断学习能力。",
          "纸卡也能检验这个顺序：先预测自己是否能解释，翻开题目尝试，再对照参考说出差距。之后的网页只是把这几个动作组织起来，不会因为界面像聊天就自动拥有诊断能力。"
        ],
        "example": {
          "title": "三张经过人工检查的合成卡片",
          "text": "① 问：一次页面点击可以证明掌握吗？参考：不能，需要与学习目标相关的表现证据。\n② 问：什么时候看参考解释？参考：先独立尝试，再对照并修正。\n③ 问：反馈后还缺哪一步？参考：让学习者实际修改或再次尝试。\n这些是本课练习材料，不是自动生成的个体评价。"
        },
        "task": "选自己熟悉的主题写三张卡片，每张包含题目、审核过的参考解释和来源。先拿纸卡手动走一次循环，找出模糊问题。",
        "checklist": [
          "问题范围清楚且有可核对参考。",
          "看答案之前有独立尝试。",
          "我说明了助手目前做不到什么。"
        ],
        "question": {
          "prompt": "为了观察学习者能否主动回想，初始界面应该怎样？",
          "options": [
            {
              "text": "同时展示题目与完整答案。",
              "correct": false,
              "feedback": "这样很难区分主动回想与照着答案复述。"
            },
            {
              "text": "先显示题目，用户尝试后再主动打开参考。",
              "correct": true,
              "feedback": "这能保留回想的机会，同时让核对成为明确动作。"
            },
            {
              "text": "自动填好回答，再让用户点完成。",
              "correct": false,
              "feedback": "系统代答取消了主动产生答案的机会，完成记录无法说明回想。"
            }
          ]
        },
        "sources": [
          {
            "title": "IES · Organizing Instruction and Study",
            "url": "https://ies.ed.gov/ncee/wwc/PracticeGuide/1"
          }
        ],
        "module": "定义助手的工作",
        "figureKey": "assistant-flow"
      },
      {
        "id": "assistant-boundary",
        "title": "规则助手、生成助手与人的分工",
        "module": "定义助手的工作",
        "minutes": 15,
        "conceptIds": [],
        "objective": "识别固定规则可以完成的动作，明确哪些输出需要人工审核。",
        "paragraphs": [
          "助手是帮助你完成任务的一套流程，不必一开始就有聊天框。按顺序出示卡片、隐藏参考、保存反思，都可以由确定的规则完成。输入相同、状态相同时，规则程序会给出预先写定的结果，便于理解与检查。",
          "生成式模型则根据输入产生文本，可能出现意外表达或错误。让它草拟候选题可以节省起稿时间，但不等于它知道某位学生真实掌握程度。必须先决定人要审核哪一部分，以及输出不可靠时怎样继续。",
          "本课程只实现本地、预先审核的卡片助手。交互图中的阶段切换与示例回复都是脚本演示，不调用真实模型，也没有自动诊断。把实际能力标清楚以后，你能先验证流程有没有帮助，再决定未来是否值得增加外部服务。"
        ],
        "example": {
          "title": "同一句话为何总是出现？",
          "text": "预测按相同顺序操作是否得到相同提示；重复走脚本流程，指出预写内容与用户输入各在哪里。解释这不能用来测量模型智能。"
        },
        "task": "列出助手的三个规则动作、一项可由模型草拟的材料和一项必须由人负责的判断；在原型写明“不调用模型”。",
        "checklist": [
          "规则与生成能力明确区分。",
          "脚本反馈标明演示性质。",
          "没有宣称系统诊断个人能力。"
        ],
        "question": {
          "prompt": "预写提示每次按按钮显示，应该如何描述？",
          "options": [
            {
              "text": "模型实时理解了学习者。",
              "correct": false,
              "feedback": "固定脚本没有执行这样的推断。"
            },
            {
              "text": "规则按当前阶段显示已审核提示。",
              "correct": true,
              "feedback": "提示由预先设定的规则和阶段决定，没有发生模型推理。"
            },
            {
              "text": "系统已经判断长期掌握。",
              "correct": false,
              "feedback": "显示提示不构成能力证据。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · JS",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript"
          },
          {
            "title": "How People Learn II",
            "url": "https://doi.org/10.17226/24783"
          }
        ],
        "figureKey": "assistant-flow"
      },
      {
        "id": "card-data",
        "figureKey": "assistant-flow",
        "title": "把卡片内容写成可检查的数据",
        "module": "定义助手的工作",
        "minutes": 15,
        "conceptIds": [],
        "objective": "分开题目、参考、来源与稳定 ID，避免换顺序后记录错位。",
        "paragraphs": [
          "当题目从一张变成多张，最好把内容与界面代码分开。一个卡片对象可以保存 id、题目、参考解释与来源；多个对象组成数组，也就是按顺序排列的一组数据。界面从数据读取文字，修改材料就不必复制整段按钮代码。",
          "ID 是卡片的稳定名字，应与位置分开。例如 evidence-01 即使从第一张移到第三张，仍表示同一个问题。若只把“第零张”当身份，插入新题以后，旧反思可能误贴到另一张卡。这是数据设计问题，不是样式问题。",
          "先用三张自己熟悉主题的合成卡片，每张由人核对参考与来源。题目应能独立理解，参考写关键理由而非唯一措辞。不要把学生姓名当 ID，也不要把无法查证的模型回答直接存成标准答案；内容质量是助手运行前的前提。"
        ],
        "example": {
          "title": "题目换位置，反思跟谁走？",
          "text": "预测在列表头插入新卡后“第一张的反思”还属于原题吗；用纸卡交换顺序，对照稳定 ID 与位置编号，解释哪种更可靠。",
          "code": "const cards = [{\n  id: \"evidence-01\",\n  question: \"点击过页面，能证明掌握吗？\",\n  reference: \"不能，需要与目标有关的独立表现。\",\n  source: \"https://ies.ed.gov/ncee/wwc/PracticeGuide/1\"\n}];"
        },
        "task": "写三张带稳定 ID 的卡片，交换顺序后仍能找到对应来源与笔记；检查重复 ID 和不清楚的题目。",
        "checklist": [
          "卡片有唯一且稳定的 ID。",
          "参考解释与来源经过检查。",
          "记录不靠数组位置识别题目。"
        ],
        "question": {
          "prompt": "新增题目后旧反思贴错卡，优先检查？",
          "options": [
            {
              "text": "背景颜色是否太浅。",
              "correct": false,
              "feedback": "反思贴到哪张卡由数据标识决定，改变背景色不能修复关联。"
            },
            {
              "text": "是否用列表位置代替稳定卡片 ID。",
              "correct": true,
              "feedback": "顺序改变会使位置标识失去原来的对应关系。"
            },
            {
              "text": "是否需要更长的动画。",
              "correct": false,
              "feedback": "动画不能修复数据关联。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · array",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array"
          },
          {
            "title": "MDN · JSON",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON"
          }
        ]
      },
      {
        "id": "attempt-before-reference",
        "title": "先让回答发生，再打开参考",
        "module": "实现回想循环",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:retrieval-practice"
        ],
        "objective": "设置清楚的尝试与核对阶段，避免把看过答案误记为独立回答。",
        "paragraphs": [
          "回想的关键动作是先尝试产生答案。助手如果一开始就显示完整解释，用户仍然可以阅读学习，但记录应反映“看过参考”，不能再把随后的复述当作完全独立回想。界面顺序会改变你能观察到的证据。",
          "初始页面先展示题目与输入区，旁边说明可以写“不确定”。用户主动打开参考后，保留原回答，再出现对照提示。不要为了逼迫回答而制造无法继续的死路；求助也是有效行动，只需区分是否使用了支持。",
          "如果提供提示层级，先给方向，再给部分步骤，最后给完整参考。层级应由用户需要决定，而不因点了几次就判定能力。记录是否看过参考可以帮助解释这次练习，却不是自动评分，也不能据此给人长期标签。"
        ],
        "example": {
          "title": "参考出现早晚改变了什么？",
          "text": "先预测两版界面留下的答案能否直接比较；一版先看参考，一版先写回答，再比较原文依赖程度并解释证据差异。"
        },
        "task": "为卡片画未作答、已尝试、已看参考三种状态；实现或纸面演示切换，确保原回答保留且求助可达。",
        "checklist": [
          "首次界面不提前覆盖题目。",
          "看过参考与独立尝试被区分。",
          "允许表达不确定和请求帮助。"
        ],
        "question": {
          "prompt": "用户先看了参考再答对，记录应怎么写？",
          "options": [
            {
              "text": "独立掌握且无需再练。",
              "correct": false,
              "feedback": "本次有参考支持，不能这样推断。"
            },
            {
              "text": "此次核对后作答成功，仍需之后独立检查。",
              "correct": true,
              "feedback": "如实记录条件才能解释表现。"
            },
            {
              "text": "完全无效，删除所有记录。",
              "correct": false,
              "feedback": "有支持的学习仍有价值，只是证据含义不同。"
            }
          ]
        },
        "sources": [
          {
            "title": "Testing (quizzing) boosts classroom learning: A systematic and meta-analytic review.",
            "url": "https://doi.org/10.1037/bul0000309"
          },
          {
            "title": "Organizing Instruction and Study to Improve Student Learning (IES Practice Guide)",
            "url": "https://ies.ed.gov/ncee/wwc/PracticeGuide/1"
          }
        ],
        "figureKey": "retrieval"
      },
      {
        "id": "local-prototype",
        "figureKey": "assistant-flow",
        "title": "用本地状态做出一个循环",
        "minutes": 22,
        "conceptIds": [
          "pedagogy:metacognitive-calibration"
        ],
        "objective": "运行一个不联网的反思卡，并知道记录存在哪里。",
        "paragraphs": [
          "先用一个 textarea 收集自己的解释，用按钮显示参考，再用第二个 textarea 写下对照后的差距。保存的只是你输入的反思，不是系统判断的成绩。",
          "localStorage 可以在同一站点、同一浏览器保存小量文字。清理站点数据、换浏览器或隐私窗口结束后，记录可能消失；file: 地址下的行为没有统一保证。需要稳定验证存储时，通过本地 HTTP 服务访问页面。",
          "下面片段放入网页入门的 HTML 外壳即可运行。它捕获保存失败，并提供只删除本练习记录的按钮。不联网、不放 API 密钥，也不收集姓名、成绩或真实学生作答。",
          "textarea 是允许输入多行文字的控件，label 是说明它用途的可见标签。try/catch 表示先尝试操作，若发生错误就走替代处理。本例通过这条失败路径提醒复制笔记，避免把未保存冒充已保存。"
        ],
        "example": {
          "title": "反思卡主体片段",
          "text": "先回答，再打开参考。刷新只恢复已保存的反思，避免把临时输入冒充已保存。保存按钮不会判断答案是否正确。",
          "code": "<main>\n<h1>点击过，等于掌握了吗？</h1>\n<label for=\"answer\">先写你的解释</label><br>\n<textarea id=\"answer\" rows=\"3\"></textarea>\n<details><summary>我已尝试，查看参考</summary>\n<p>点击是使用记录。掌握需要与目标相关的表现，以及更多情境中的检查。</p></details>\n<label for=\"note\">对照后，我要修正什么？</label><br>\n<textarea id=\"note\" rows=\"3\"></textarea><br>\n<button id=\"save\">保存我的反思</button>\n<button id=\"clear\">删除这条反思</button>\n<p id=\"status\" role=\"status\">仅保存在此浏览器。</p>\n</main>\n<script>\nconst key = \"my-reflection-v1\";\nconst note = document.querySelector(\"#note\");\nconst status = document.querySelector(\"#status\");\ntry { note.value = localStorage.getItem(key) || \"\"; }\ncatch { status.textContent = \"无法读取本地记录，仍可练习。\"; }\ndocument.querySelector(\"#save\").onclick = () => {\n  if (!note.value.trim()) { status.textContent = \"请先写下反思。\"; return; }\n  try { localStorage.setItem(key, note.value); status.textContent = \"反思已保存，仅在此浏览器。\"; }\n  catch { status.textContent = \"未能保存，请复制到自己的笔记。\"; }\n};\ndocument.querySelector(\"#clear\").onclick = () => {\n  try { localStorage.removeItem(key); note.value = \"\"; status.textContent = \"这条反思已删除。\"; }\n  catch { status.textContent = \"未能删除，请检查浏览器存储设置。\"; }\n};\n</script>"
        },
        "task": "运行片段，写一条反思并保存，刷新检查是否恢复；再删除并刷新检查。接着试空输入。若使用 file: 无法保存，记录限制，或用编辑器的本地预览服务器再测。",
        "checklist": [
          "可以完成回答、核对、反思的循环。",
          "保存失败时有明确提示，不假装成功。",
          "删除只影响本练习记录。"
        ],
        "question": {
          "prompt": "在另一台设备看不到反思，最可能的原因是什么？",
          "options": [
            {
              "text": "本例只存当前浏览器，没有账号或同步服务。",
              "correct": true,
              "feedback": "对。跨设备同步是另一项需要设计、实现与验证的能力。"
            },
            {
              "text": "代码已经自动上传，只是网络比较慢。",
              "correct": false,
              "feedback": "示例没有任何上传请求，不能暗示存在云端备份。"
            },
            {
              "text": "反思只存在课程作者的电脑上。",
              "correct": false,
              "feedback": "数据由当前使用者浏览器保存，不会自动写到作者设备。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · localStorage",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
          },
          {
            "title": "EEF · Metacognition and self-regulation",
            "url": "https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/metacognition-and-self-regulation"
          }
        ],
        "module": "实现回想循环"
      },
      {
        "id": "compare-reflection",
        "figureKey": "assistant-flow",
        "title": "反思不是写心得，而是找一个差距",
        "module": "实现回想循环",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:metacognitive-calibration"
        ],
        "objective": "用原回答、关键要点与修正行动支持具体反思。",
        "paragraphs": [
          "“我学到了很多”很难指导下一次练习。有效反思可以很短：原来怎么想，参考指出哪个关键差距，下次要做什么。界面保留原回答，能让学习者直接比较，而不是凭记忆重新描述自己刚才的错误。",
          "对于证据判断卡，可以把参考分为“判断”“理由”“查证方法”三个要点。用户自行标出遗漏处并写修正。这里的勾选表示本人完成了对照，不是程序已经理解答案，也不是老师确认其正确。",
          "不同的正确表达不一定包含同样关键词。用字符串是否包含“证据”来判定理解，会把抄词误当掌握，也可能错杀准确的另一种说法。当前原型只提供参考和自查，关键内容仍由人判断；未来自动评价也需单独验证。"
        ],
        "example": {
          "title": "有关键词就会了吗？",
          "text": "预测“证据证据证据”能否通过机械关键词规则；与一句没有该词却解释查证方法的回答比较，说明程序匹配与理解判断的差异。"
        },
        "task": "把一张卡的参考拆成三个要点，写一条具体修正及下一次动作；在页面注明自查不等于自动评分。",
        "checklist": [
          "原回答在核对时仍可见。",
          "反思定位到一个具体差距。",
          "自评与系统判断没有混写。"
        ],
        "question": {
          "prompt": "程序发现答案含“证据”，最稳妥的解释是？",
          "options": [
            {
              "text": "已证明理解透彻。",
              "correct": false,
              "feedback": "出现词语不能保证推理正确。"
            },
            {
              "text": "只说明文本出现该词，仍需检查实际解释。",
              "correct": true,
              "feedback": "字符串结果不能替代语义与学习判断。"
            },
            {
              "text": "说明模型已分析思维过程。",
              "correct": false,
              "feedback": "本例只是匹配文本中的字符，并未调用模型分析或验证理解。"
            }
          ]
        },
        "sources": [
          {
            "title": "How People Learn II",
            "url": "https://doi.org/10.17226/24783"
          },
          {
            "title": "MDN · textContent",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent"
          }
        ]
      },
      {
        "id": "plan-next-session",
        "figureKey": "assistant-flow",
        "title": "给下一次练习一个具体起点",
        "module": "实现回想循环",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:spacing"
        ],
        "objective": "根据当前差距安排复习任务，避免假装已有最佳推荐算法。",
        "paragraphs": [
          "一次核对结束后，助手可以帮助你写下一次练什么、什么时候练、从哪里开始。这比只显示“继续加油”更容易执行。例如“明天晚饭后，用新广告判断事实与观点”，同时交代时间、材料和动作。",
          "原型可以让用户自己选择日期，保存到本地计划中。日期出现并不等于系统会主动通知；没有实现通知服务，就要写明需自己查看或另外设置日历。也不能把简单日期加一称作经过验证的个性化最优间隔。",
          "到下一次练习时，先用新题独立尝试，再决定是否需要返回示例。若错过计划，允许改期并保留已做内容，不用清空进度惩罚用户。计划是帮助行动的工具，实际回答才是理解是否变化的观察来源。"
        ],
        "example": {
          "title": "保存计划会自动提醒吗？",
          "text": "预测只存一个日期是否会让电脑明天主动弹窗；查看原型的实际机制，区分“待办记录”和“通知服务”，解释还缺哪个动作。"
        },
        "task": "为一处真实差距写下一次练习的时间、材料和目标；在原型注明计划是否提供提醒，并试一次改期。",
        "checklist": [
          "计划有具体练习动作。",
          "日期记录没有冒充自动通知。",
          "错过日期可以调整且保留记录。"
        ],
        "question": {
          "prompt": "只在 localStorage 保存明天日期，能承诺什么？",
          "options": [
            {
              "text": "明天一定跨设备推送通知。",
              "correct": false,
              "feedback": "本地记录并未实现通知或同步。"
            },
            {
              "text": "已经计算出最佳记忆间隔。",
              "correct": false,
              "feedback": "手动或固定日期不是效果验证的算法。"
            },
            {
              "text": "当前浏览器保存了一个计划，用户可再次查看。",
              "correct": true,
              "feedback": "能力描述与实现范围相符。"
            }
          ]
        },
        "sources": [
          {
            "title": "Distributed practice in verbal recall tasks: A review and quantitative synthesis.",
            "url": "https://doi.org/10.1037/0033-2909.132.3.354"
          },
          {
            "title": "MDN · storage",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API"
          }
        ]
      },
      {
        "id": "data-control",
        "figureKey": "assistant-flow",
        "title": "让用户知道记录在哪，也能带走与删除",
        "module": "检查与扩展",
        "minutes": 15,
        "conceptIds": [],
        "objective": "解释本地数据边界，设计可控的导出和清除路径。",
        "paragraphs": [
          "本地保存的意思是数据留在这个浏览器的站点存储中，不等于永久保险箱。换设备、清理站点数据或某些隐私设置都可能导致记录不可见。助手应在保存处说明范围，让用户决定是否还要保留自己的副本。",
          "最小导出可以先提供“复制我的反思”所需的纯文本区域，不必马上做复杂云同步。内容包括卡片题目、日期与用户自写笔记，避免导出不必要的个人信息。若使用下载文件，应说明格式与用途，不假装已经发送给老师。",
          "删除时只删除本助手约定的键，不使用清空整个站点的方式误删其他工具数据。对删除范围给清楚说明，并在完成后重新读取验证。练习用假笔记测试保存、复制和删除，使数据控制成为实际可用的路径。"
        ],
        "example": {
          "title": "删除一张卡会误伤谁？",
          "text": "预测清空整个存储与删除指定键的影响范围；用两个不同练习键对照，解释为何助手应只动自己的记录。"
        },
        "task": "写出记录位置与丢失条件，做一份可复制的反思文本；删除本练习键后刷新验证，确认别的测试键仍在。",
        "checklist": [
          "用户知道数据只在当前浏览器。",
          "可以自行保留文本副本。",
          "删除范围限定到本工具记录。"
        ],
        "question": {
          "prompt": "要删本助手一条反思，优先用？",
          "options": [
            {
              "text": "删除对应的存储键。",
              "correct": true,
              "feedback": "范围清楚，避免误删同站其他记录。"
            },
            {
              "text": "localStorage.clear() 清空一切。",
              "correct": false,
              "feedback": "可能影响同源下其他功能保存的数据。"
            },
            {
              "text": "只让按钮变灰。",
              "correct": false,
              "feedback": "界面变化不代表底层记录已删除。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · storage",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API"
          },
          {
            "title": "MDN · localStorage",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
          }
        ]
      },
      {
        "id": "evaluate",
        "figureKey": "assistant-flow",
        "title": "先检查，再决定要不要接 AI",
        "minutes": 15,
        "conceptIds": [
          "pedagogy:metacognitive-calibration"
        ],
        "objective": "区分功能测试、内容审核与学习观察，明确 AI 的可选角色。",
        "paragraphs": [
          "功能测试看循环是否正常：空输入、重复保存、刷新、删除、存储被禁用。内容审核看题目与解释是否准确。学习观察则看用户是否尝试、能否指出差距，以及之后能否独立说明。这三类检查不能互相替代。",
          "下一次练习可以先让自己预测会答到什么程度，再与实际表现对照。信心很高却解释不清，是值得再练的信号；不要把用户自评当作系统给出的能力等级。",
          "只有发现明确缺口，再考虑 AI，例如提出候选题目供你审核。若以后接模型服务，密钥必须保留在服务端，并检查数据如何传输与保存；本课原型不包含该功能。AI 生成的题目、答案和评价都需要检查，不能直接包装为可靠个体诊断。",
          "先预测某个改动会影响哪类证据，再运行对应检查并解释结果。若只是按钮更容易找到，应报告可用性观察；若要讨论学习变化，还需独立任务和后续检查，而不是把两类成功合成一句“有效”。"
        ],
        "example": {
          "title": "分开写三种检查结果",
          "text": "功能：刷新后反思保留，删除后不再出现。\n内容：第三题的“再试一次”过于模糊，补成“在新句子里给出证据”。\n观察：我能复述参考，但第二天面对新例子仍不会判断。\n下一步：补一个迁移例子；暂时没有必要增加聊天功能。"
        },
        "task": "为原型写三条功能检查、两条内容检查和一次后续学习观察。最后写一句“只有当……时，我才考虑接入 AI”，说明具体缺口。",
        "checklist": [
          "没有用使用时长或星星数替代学习证据。",
          "每张卡的解释由人检查过。",
          "扩展计划有明确需求与验证方式。"
        ],
        "question": {
          "prompt": "原型让用户连续练习七天，能否直接宣称它提高了学习效果？",
          "options": [
            {
              "text": "能，连续使用就是效果证明。",
              "correct": false,
              "feedback": "连续使用是参与记录。学习效果需要对目标表现的检查，因果结论还需要更严格设计。"
            },
            {
              "text": "不能，应单独检查学习表现及其他解释。",
              "correct": true,
              "feedback": "对。可以如实报告使用情况，并保留对效果的判断边界。"
            },
            {
              "text": "只要是 AI 帮忙写的工具，就一定有效。",
              "correct": false,
              "feedback": "开发方式不构成教学效果证据，本原型也未调用模型。"
            }
          ]
        },
        "sources": [
          {
            "title": "How People Learn II",
            "url": "https://doi.org/10.17226/24783"
          },
          {
            "title": "MDN · localStorage",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
          }
        ],
        "module": "检查与扩展"
      },
      {
        "id": "assistant-capstone",
        "figureKey": "assistant-flow",
        "title": "完成一份诚实可用的助手说明",
        "module": "检查与扩展",
        "minutes": 15,
        "conceptIds": [],
        "objective": "交付本地练习循环、内容审核与扩展条件。",
        "paragraphs": [
          "把助手交给别人试用前，需要用一句话说清楚它帮助什么：例如“用三张人工审核的卡片，先回想、再核对、最后保存自己的反思”。这比“全能智能导师”更容易理解，也让试用者知道如何检查。",
          "分别准备功能记录、内容审核和学习观察。功能看保存与删除等路径；内容看题目是否准确；学习观察看尝试、修改以及之后能否独立解释。若三项中有未做内容，应如实标明，不把脚本顺利运行写成已验证学习效果。",
          "最后列出一个最值得继续验证的缺口。如果未来需要模型草拟题目，先写人工审核入口、失败处理、数据范围与服务端密钥边界；这些是后续计划，不是本课程现有功能。一个边界清楚的小助手，比能力表述含糊的大界面更便于维护。"
        ],
        "example": {
          "title": "读者能识别真实能力吗？",
          "text": "预测只看说明的人会不会以为有自动评分；请自己逐条把说明映射到实际按钮和代码，删改找不到实现依据的词。"
        },
        "task": "交付三张卡、可运行本地页面、数据说明和三类检查记录；写一个有触发条件的扩展计划，标注尚未实现。",
        "checklist": [
          "说明逐条对应现有功能。",
          "内容审核与功能测试分开记录。",
          "未来能力明确标为计划。"
        ],
        "question": {
          "prompt": "交付时发现没有模型请求，名称与说明应该？",
          "options": [
            {
              "text": "继续声称实时 AI 诊断。",
              "correct": false,
              "feedback": "这会让用户误解实际机制。"
            },
            {
              "text": "清楚描述本地卡片助手与脚本流程。",
              "correct": true,
              "feedback": "准确的范围说明是可用产品的一部分。"
            },
            {
              "text": "删除全部已做的练习。",
              "correct": false,
              "feedback": "无需调用模型也可以形成有用的学习流程。"
            }
          ]
        },
        "sources": [
          {
            "title": "How People Learn II",
            "url": "https://doi.org/10.17226/24783"
          },
          {
            "title": "MDN · storage",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API"
          }
        ]
      }
    ]
  },
  {
    "slug": "landing-page",
    "title": "让别人一眼知道从哪开始：做工具的介绍页",
    "category": "Vibe coding",
    "summary": "从来访者的任务开始，组织承诺、示例、内容结构、视觉规则、手机适配与表单，交付可验收的首页。",
    "outcome": "一个有明确主行动、可访问结构和检查记录的单页原型。",
    "audience": {
      "who": "东西已经做出来了，却没人看懂它是给谁用的老师或独立开发者",
      "pain": "我把链接发出去，别人点进来看两眼就走了，一句话也不问。",
      "win": "一个单页原型：首屏一句话说清给谁用，只有一个主按钮，手机上也不错位。"
    },
    "prerequisite": "完成网页入门，或能在现有页面中修改 HTML 与 CSS。",
    "conceptIds": [],
    "lessons": [
      {
        "id": "audience",
        "figureKey": "web-layers",
        "title": "先选一种来访者与一个任务",
        "module": "明确首页承诺",
        "minutes": 15,
        "conceptIds": [],
        "objective": "用具体场景缩小首页的服务对象，形成可检查的主路径。",
        "paragraphs": [
          "首页是访客理解产品并选择下一步的入口。它不需要在第一屏解释所有技术，而应帮助一个真实的人完成眼前任务。先想象一位备课老师：她只有几分钟，想找一份明天能用的讨论活动，不是来研究网站的全部架构。",
          "写下她从哪里来到页面、带着什么疑问、希望带走什么。如果同页同时面向学生、家长、教师和开发者，每个入口都同样突出，就容易没人知道先点哪里。可以先服务一种主要来访者，其余需求用清楚的次要链接承接。",
          "本课程会为虚构阅读活动库做首页：访客读介绍、看示例、理解使用方式并找到材料。这样能具体检查入口是否有效。用户画像不是编一个年龄和爱好标签，而是说明任务、情境与限制；后来有真实观察时，应允许修正。"
        ],
        "example": {
          "title": "两位访客会点同一处吗？",
          "text": "预测备课老师与想看源码的开发者各自需要哪个入口；写两条访问路线，选本轮主要路线并解释取舍。"
        },
        "task": "写一个来访场景，限定一个主要任务；列出完成它必须回答的三个问题，暂不画视觉细节。",
        "checklist": [
          "对象由任务与情境定义。",
          "主路径只有一个优先目标。",
          "没有把假设当真实调研数据。"
        ],
        "question": {
          "prompt": "首页面向所有人导致入口拥挤时，先做什么？",
          "options": [
            {
              "text": "给每个按钮都加大字号。",
              "correct": false,
              "feedback": "视觉放大无法解决优先级冲突。"
            },
            {
              "text": "明确主要来访任务并组织主次入口。",
              "correct": true,
              "feedback": "先决定服务路径，布局才有依据。"
            },
            {
              "text": "增加更多技术名词。",
              "correct": false,
              "feedback": "术语可能进一步提高理解门槛。"
            }
          ]
        },
        "sources": [
          {
            "title": "W3C WAI · Writing for Web Accessibility",
            "url": "https://www.w3.org/WAI/tips/writing/"
          }
        ]
      },
      {
        "id": "promise",
        "figureKey": "responsive",
        "title": "首屏先回答一个问题",
        "minutes": 12,
        "conceptIds": [],
        "objective": "让访客理解这是给谁、解决什么、下一步做什么。",
        "paragraphs": [
          "教育产品很容易用“大模型赋能学习”介绍自己，却让访客猜具体用途。先写一个对象、一个情境、一个可兑现的动作：为需要课堂讨论材料的教师，提供可改写的证据判断活动。",
          "标题负责说清价值，下面一句话补充范围，主按钮指向真实可达的下一步。研究设想应有明确状态，不要让探索中的能力看起来已经可用。",
          "用一个真实截图、示例题或可打开的演示支持介绍。没有数据就不编造提升比例；有案例也应说清它展示了什么，而不是自动推广到所有学习者。",
          "动手前先预测陌生访客点按钮后期待什么，再把目的地真实打开核对。首页文案和链接是一项完整承诺，文字明确却指错资源，仍然会让用户走不下去。"
        ],
        "example": {
          "title": "把架构介绍换成具体入口",
          "text": "标题：把一段阅读材料变成证据讨论。\n说明：选一个示例，改写问题与提示，带进你的下一次课堂。\n主行动：打开一个示例。\n补充：当前提供静态活动模板；不自动评分，也未验证课堂成效。"
        },
        "task": "写出自己的标题、说明与按钮文字。把它交给不了解项目的人，只问“你觉得这里能帮你做什么？点按钮后会看到什么？”，先记录再解释。",
        "checklist": [
          "对象与任务具体。",
          "主按钮指向现有内容。",
          "没有把设想、演示和已验证结果混写。"
        ],
        "question": {
          "prompt": "哪种按钮文字更便于预测下一步？",
          "options": [
            {
              "text": "开启未来",
              "correct": false,
              "feedback": "它很难说明点击后的具体结果。"
            },
            {
              "text": "打开阅读活动示例",
              "correct": true,
              "feedback": "说明了对象和动作，前提是按钮确实指向该示例。"
            },
            {
              "text": "立即赋能。",
              "correct": false,
              "feedback": "抽象承诺没有说明具体对象或目的地，访客仍需猜。"
            }
          ]
        },
        "sources": [
          {
            "title": "W3C WAI · Writing for Web Accessibility",
            "url": "https://www.w3.org/WAI/tips/writing/"
          }
        ],
        "module": "明确首页承诺"
      },
      {
        "id": "evidence-status",
        "figureKey": "web-layers",
        "title": "用可打开的示例支持承诺",
        "module": "明确首页承诺",
        "minutes": 15,
        "conceptIds": [],
        "objective": "区分功能演示、研究设想与效果证据。",
        "paragraphs": [
          "“帮助老师快速准备讨论”是一个需要具体支持的承诺。示例题、活动截图或能打开的模板，可以让访客知道拿到什么。它们证明的是材料或功能存在，并不自动证明所有课堂都会提高成绩。",
          "为首页选一段真正可访问的阅读材料，展示一个问题和一条提示，再写清楚使用条件。尚在探索的自动反馈能力应标注为研究中，而不能与已经可以下载的模板排在一起，让人误以为全都可用。",
          "没有测量数据时不要编“提升百分之多少”；有访谈反馈也应注明它反映体验。真实案例可以写过程与边界，避免暗示普遍因果。让承诺、展示内容与实际入口一致，能减少访客失望，也使后续用户测试更容易解释。"
        ],
        "example": {
          "title": "截图能证明多少？",
          "text": "预测一张漂亮活动截图能否证明学生记得更久；点击示例核对功能存在，再列出要证明记忆保持还缺哪些观察。"
        },
        "task": "选择一个现有示例，写“展示了什么”“尚未证明什么”；把草稿能力与可用能力分别标明。",
        "checklist": [
          "示例能够实际打开。",
          "状态标签与实现一致。",
          "没有使用无依据的效果比例。"
        ],
        "question": {
          "prompt": "活动截图最直接支持哪种说法？",
          "options": [
            {
              "text": "所有学生成绩都会提高。",
              "correct": false,
              "feedback": "截图没有提供学习效果数据。"
            },
            {
              "text": "学习困难已被解决。",
              "correct": false,
              "feedback": "需要具体人群与表现证据。"
            },
            {
              "text": "当前提供这种题目与提示的示例。",
              "correct": true,
              "feedback": "可打开的题目与提示能支持“提供示例”，但不直接支持学习效果。"
            }
          ]
        },
        "sources": [
          {
            "title": "W3C WAI · Writing for Web Accessibility",
            "url": "https://www.w3.org/WAI/tips/writing/"
          },
          {
            "title": "How People Learn II",
            "url": "https://doi.org/10.17226/24783"
          }
        ]
      },
      {
        "id": "page-outline",
        "figureKey": "web-layers",
        "title": "用内容顺序回答访客疑问",
        "module": "组织内容与视觉",
        "minutes": 15,
        "conceptIds": [],
        "objective": "把首页拆成每段承担一个问题的内容结构。",
        "paragraphs": [
          "内容结构是页面先说什么、后说什么，以及各部分怎样连接。对于活动库，可以依次回答“适合我吗”“材料长什么样”“怎么用”“有什么限制”。先把这些问题写成短段落，比直接往空页面堆卡片更容易发现遗漏。",
          "每个区域最好有一个能独立理解的标题。示例区放实际材料，步骤区说明操作，限制区交代当前范围。若两个区域都在重复“创新赋能”，就没有帮助访客向前一步。把重复价值口号换成具体准备条件或使用说明。",
          "导航应与页面结构对应。页内链接跳到真实存在的标题区域，固定顶部导航也不能把目标遮住。初版用单列足以检查顺序，之后再按内容关系增加列数；视觉变化不能破坏正文在窄屏和辅助阅读中的合理次序。"
        ],
        "example": {
          "title": "把页面剪成四张纸",
          "text": "预测打乱顺序后访客会先问哪个问题；把介绍、示例、步骤、限制四张纸重新排序，解释每张承接了什么疑问。"
        },
        "task": "写四个区域标题与每区两句内容；检查每个标题是否独特，删除一处重复口号并补真实信息。",
        "checklist": [
          "每区回应一个具体疑问。",
          "标题与内容一致。",
          "导航目标确实存在。"
        ],
        "question": {
          "prompt": "步骤区与介绍区内容完全重复，应该？",
          "options": [
            {
              "text": "保留，因为重复越多越可信。",
              "correct": false,
              "feedback": "重复口号没有提供操作信息。"
            },
            {
              "text": "让步骤区说明真实的开始方法。",
              "correct": true,
              "feedback": "不同区域承担不同问题才能推进理解。"
            },
            {
              "text": "把重复句子全部变成图片。",
              "correct": false,
              "feedback": "改变媒介不解决信息缺失。"
            }
          ]
        },
        "sources": [
          {
            "title": "W3C WAI · Page Structure",
            "url": "https://www.w3.org/WAI/tutorials/page-structure/"
          }
        ]
      },
      {
        "id": "structure",
        "title": "用结构帮助用户浏览",
        "minutes": 18,
        "conceptIds": [],
        "objective": "制作语义清楚、窄屏可读、键盘可达的页面骨架。",
        "paragraphs": [
          "用 main 包住主要内容，用标题组织层级，链接负责前往目的地，按钮负责当前页面里的动作。不要只把文字变大当标题，也不要用可点击 div 代替原生控件。",
          "先用单列完成“介绍 → 示例 → 如何使用 → 限制与来源”。宽屏再增加列数。正文限制行宽、给卡片留间距，可以让同一套内容在手机上仍然易读。",
          "把下面片段放入带有字符编码、viewport 和 title 的 HTML 页面。将示例路径替换为确实存在的目标，或者先把演示放到当前页面的 #example 区域。",
          "语义就是元素承担的内容角色。例如主标题负责说明整页主题，二级标题划分内容区域；它们不是单纯的字号选择。可访问性则要求不同操作方式的人能读取和使用内容，键盘路径是本次起点检查。"
        ],
        "example": {
          "title": "少量结构就能明确下一步",
          "text": "这是页面主体片段，配合网页入门课的 HTML 外壳使用。锚点有对应目标；示例先用普通文字也成立。",
          "code": "<main>\n  <header>\n    <p>给想尝试证据讨论的教师</p>\n    <h1>把阅读材料变成一次有理由的判断</h1>\n    <p>从现有活动开始，调整问题与提示。</p>\n    <a href=\"#example\">查看活动示例</a>\n  </header>\n  <section id=\"example\" aria-labelledby=\"example-title\">\n    <h2 id=\"example-title\">先试一道题</h2>\n    <p>“这条街最美”可以怎样验证？写下你的理由。</p>\n  </section>\n</main>\n<style>\nmain{max-width:68rem;margin:auto;padding:clamp(1rem,4vw,4rem)}\np{max-width:42rem;line-height:1.8}\na:focus-visible{outline:3px solid #6654cc;outline-offset:5px}\nsection{margin-top:3rem;scroll-margin-top:2rem}\n</style>"
        },
        "task": "做出单页原型，把全部链接点一遍。缩到 390px 宽，只用键盘走完整个主路径；给图片补充符合用途的替代文字。",
        "checklist": [
          "标题顺序表达内容结构。",
          "Tab 能到达全部交互元素并看到焦点。",
          "窄屏不遮挡正文或主行动。"
        ],
        "question": {
          "prompt": "“查看示例”会跳转到另一页，应该优先使用什么？",
          "options": [
            {
              "text": "带正确 href 的链接。",
              "correct": true,
              "feedback": "链接表达导航目的，浏览器和辅助技术能使用其原生行为。"
            },
            {
              "text": "只有 onclick 的普通段落。",
              "correct": false,
              "feedback": "它缺少原生链接语义和键盘行为，徒增实现负担。"
            },
            {
              "text": "只有外观像按钮、没有链接地址的 span。",
              "correct": false,
              "feedback": "视觉外观不提供导航语义；应让目的地成为可操作的链接。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · Accessibility",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility"
          },
          {
            "title": "MDN · Responsive design",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design"
          }
        ],
        "module": "组织内容与视觉",
        "figureKey": "responsive"
      },
      {
        "id": "visual-rules",
        "figureKey": "web-layers",
        "title": "先定几条视觉规则，再做装饰",
        "module": "组织内容与视觉",
        "minutes": 15,
        "conceptIds": [],
        "objective": "用字号、间距与颜色表达层级，并保持规则一致。",
        "paragraphs": [
          "视觉规则是重复使用的选择，例如正文大小、标题层级、卡片间距和主按钮样式。它让访客不用在每个区域重新猜哪些内容更重要。不是颜色越多越有设计感，而是相同用途能否表现得一致。",
          "给阅读活动首页先定正文、二级标题和主标题三档字号，再定几档间距。主行动用清楚文字和足够区分度，次要入口保持可见但不争夺同等注意。错误、成功等状态不能只靠红绿颜色，还应有文字说明。",
          "这些规则需要在真实长标题、中文段落与窄屏里检查。不要先用两三个短英文词调到漂亮，再把中文塞进去。视觉层级服务于阅读与操作，也要保留焦点轮廓和足够对比；品牌气质应建立在内容能被读懂的基础上。"
        ],
        "example": {
          "title": "所有按钮都最亮，会发生什么？",
          "text": "预测三个同样醒目的按钮是否还有主次；用纸或浏览器调整一主两次的样式，让别人指出先做什么并说理由。"
        },
        "task": "给首页写一份四项小规范：正文、标题、间距、主行动；应用到两个区域，检查一致性和长文本表现。",
        "checklist": [
          "相同用途使用相同样式。",
          "状态信息不只靠颜色。",
          "长中文内容也经过检查。"
        ],
        "question": {
          "prompt": "哪种做法更能表达主次？",
          "options": [
            {
              "text": "主行动文字具体且明显，次要链接清楚可见。",
              "correct": true,
              "feedback": "层级和可预测文字一起帮助选择。"
            },
            {
              "text": "全部按钮不停闪烁。",
              "correct": false,
              "feedback": "运动会竞争注意，也可能增加访问障碍。"
            },
            {
              "text": "把次要内容变得几乎不可读。",
              "correct": false,
              "feedback": "主次并不意味着牺牲必要信息的可读性。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · CSS",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/What_is_CSS"
          },
          {
            "title": "W3C WAI · Easy Checks",
            "url": "https://www.w3.org/WAI/test-evaluate/easy-checks/"
          }
        ]
      },
      {
        "id": "mobile",
        "title": "手机适配从内容挤压处检查",
        "module": "组织内容与视觉",
        "minutes": 15,
        "conceptIds": [],
        "objective": "理解流式布局与断点，用真实窄屏路径验收。",
        "paragraphs": [
          "响应式布局让同一份内容根据可用宽度调整排列。它不只是把桌面截图整体缩小，否则字和按钮都会难用。正文容器可以随窗口收缩，卡片在放不下时从多列改为单列，图片不超出父容器。",
          "断点是样式改变排列的宽度条件，应由内容开始拥挤的位置决定，而不必背几个设备型号。先在窄屏完成单列主路径，再扩大窗口观察是否适合增加列数。长标题、中文按钮和浏览器放大都能暴露固定宽度的限制。",
          "在约三百九十像素宽度检查首屏、示例与行动入口，再用键盘走一遍。若出现横向滚动，先找超宽图片、不可折行文字或固定宽度块，不要直接隐藏溢出来掩盖内容。适配成功的标准是任务仍能完成，而不只是卡片排齐。"
        ],
        "example": {
          "title": "卡片为什么突然挤出屏幕？",
          "text": "预测固定六百像素卡片放进窄屏的结果；把宽度改为受容器约束的值，缩放窗口，解释哪个限制改变了布局。"
        },
        "task": "把首页从窄屏拖到宽屏，记录一处开始拥挤的位置；修复后重测长标题与按钮点击区域。",
        "checklist": [
          "窄屏正文和按钮完整可见。",
          "没有用隐藏溢出掩盖重要内容。",
          "断点能解释为内容需求。"
        ],
        "question": {
          "prompt": "手机上整页被缩得很小，优先检查？",
          "options": [
            {
              "text": "是否需要更多背景动画。",
              "correct": false,
              "feedback": "背景动画不会修复文字与容器的缩放关系，应先检查布局设置。"
            },
            {
              "text": "viewport 与容器宽度、布局规则。",
              "correct": true,
              "feedback": "这些直接影响移动端的布局与缩放。"
            },
            {
              "text": "把正文全部删掉。",
              "correct": false,
              "feedback": "减少必要内容不是适配方案。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · responsive",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design"
          },
          {
            "title": "MDN · media",
            "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/@media"
          }
        ],
        "figureKey": "responsive"
      },
      {
        "id": "honest-contact",
        "figureKey": "web-layers",
        "title": "表单收集什么，就明确说什么",
        "module": "从访问到行动",
        "minutes": 15,
        "conceptIds": [],
        "objective": "给表单配标签、错误说明与真实提交状态。",
        "paragraphs": [
          "如果首页需要让老师留下活动主题，表单就是把用户输入变成后续动作的界面。字段越多不代表信息越有价值，先说明每项为什么需要。练习原型可以只收一个虚构主题，不接收真实姓名、邮箱或学生资料。",
          "标签说明填什么，提示说明格式，校验告诉用户哪里需要改。输入框中的淡色占位文字会在输入后消失，不能完全代替可见标签。出错时保留已经填写的内容，并把错误定位到相应字段，避免只在页面顶端闪一下红色。",
          "最重要的是区分本地演示与真正发送。如果没有后端接收，按钮应说“检查输入”或“预览内容”，结果应写“演示：未发送”。一次动画不构成提交成功。以后接服务时，成功提示必须依据实际响应，同时设计失败重试与数据处理说明。"
        ],
        "example": {
          "title": "看起来成功与真的发送",
          "text": "预测只弹出“成功”但没有请求能否收到主题；用演示表单输入空值与一条假主题，核对页面实际做了什么。"
        },
        "task": "给首页做一个只预览假主题的表单，补标签、空值提示和“未发送”说明；测试有效与无效输入。",
        "checklist": [
          "每个字段有可见标签。",
          "错误能定位并保留输入。",
          "演示没有冒充真实发送。"
        ],
        "question": {
          "prompt": "没有接收服务的原型应显示什么？",
          "options": [
            {
              "text": "已发给老师，稍后联系。",
              "correct": false,
              "feedback": "没有真实发送就不能承诺收件。"
            },
            {
              "text": "已建立学生档案。",
              "correct": false,
              "feedback": "原型未实现这项能力，也不需要收学生信息。"
            },
            {
              "text": "本地预览完成，内容未发送。",
              "correct": true,
              "feedback": "状态准确描述实际行为。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · forms",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form"
          },
          {
            "title": "MDN · validation",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation"
          },
          {
            "title": "W3C WAI · Forms Tutorial",
            "url": "https://www.w3.org/WAI/tutorials/forms/"
          }
        ]
      },
      {
        "id": "test",
        "figureKey": "refactor",
        "title": "检查用户能否真的走下去",
        "minutes": 15,
        "conceptIds": [],
        "objective": "记录理解与操作问题，完成一轮有依据的修改。",
        "paragraphs": [
          "让一个不了解项目的人完成任务：“找到一个你可以用在课堂里的例子，并说明需要怎么准备。”先观察，不在旁边替他指路。记录停顿、错误预期和走不通的链接。",
          "把问题分成内容理解、导航与实现。例如“不知道是否免费”需要补说明；“按钮点击后去了代码仓库”可能是预期不符；“手机按钮被遮住”是布局缺陷。分别处理，避免每个问题都演变成加新功能。",
          "修改后再走同一任务。这个检查说明页面是否可理解、可操作，不等于证明工具提高了学习效果。准备发布前，还要检查所有示例、来源和状态描述是否准确。",
          "测试前先写下你预测访客会走的路径，再观察实际是否如此。不要急着替他的停顿找原因；先问他在找什么，再将解释与观察分开，才能决定该改文案、入口还是实现。"
        ],
        "example": {
          "title": "一条可以指导修改的记录",
          "text": "观察：访客点“试一试”后进入 GitHub，不知道该下载哪个文件。\n解释：按钮许诺了直接体验，但实际提供源码。\n修改：直接体验指向演示；另设“查看源码”，注明需要本地运行。\n复查：请同一个人重新找到可运行示例。"
        },
        "task": "记录至少三条观察，选一个最影响主路径的问题修复。在更新说明中写出改了什么、为什么、怎么检查。",
        "checklist": [
          "测试者有具体任务，而非只问“好不好看”。",
          "我记录实际行为，并区分观察与推测。",
          "修复后重新走过主路径。"
        ],
        "question": {
          "prompt": "访客误把源码链接当成在线演示，最直接的改动是什么？",
          "options": [
            {
              "text": "增加更多动画。",
              "correct": false,
              "feedback": "动画无法纠正目的地与按钮预期的错位。"
            },
            {
              "text": "分别标明“在线体验”和“查看源码”，并指向相应资源。",
              "correct": true,
              "feedback": "用文字和真实目标消除误解；如果没有演示，就如实说明需要本地运行。"
            },
            {
              "text": "把所有链接都改名为“更多”。",
              "correct": false,
              "feedback": "相同而含糊的名称会隐藏目的地差异，增加试错。"
            }
          ]
        },
        "sources": [
          {
            "title": "W3C WAI · Easy Checks",
            "url": "https://www.w3.org/WAI/test-evaluate/easy-checks/"
          }
        ],
        "module": "从访问到行动"
      },
      {
        "id": "launch-review",
        "figureKey": "web-layers",
        "title": "发布前，把所有承诺走一遍",
        "module": "从访问到行动",
        "minutes": 15,
        "conceptIds": [],
        "objective": "检查页面入口、状态、来源与未完成项，形成可交付说明。",
        "paragraphs": [
          "发布前检查是把访客看到的承诺与实际资源逐一对上。标题说能试活动，就要存在能打开的活动；按钮说下载模板，就要确实得到相应文件。主页能加载，并不能证明这些支路都走得通。",
          "从首次来访开始检查主路径，再检查源码、来源、联系与返回入口。暂时没有的能力应明确标成规划或去掉入口，不留下看起来可点击却没有动作的按钮。图片替代文字应说明用途，装饰图不必重复朗读周围段落。",
          "整理更新说明：这版服务谁、提供哪些现成材料、做过什么检查、有哪些限制。把实际部署作为独立操作，本课程交付原型和检查记录，不要求公开发布。以后资源变化时，用同一清单复查，保持介绍与产品状态一致。"
        ],
        "example": {
          "title": "沿着每个动词走一次",
          "text": "预测“体验、下载、查看源码”各会得到什么；逐个打开并记录实际目的地，解释一处预期不符应改文字还是改链接。"
        },
        "task": "完成主路径与全部链接检查，写一份交付说明；明确哪些已可用、哪些仅演示，以及尚未处理的问题。",
        "checklist": [
          "主行动到达真实目标。",
          "来源与素材用途可核对。",
          "交付没有把原型说成已发布服务。"
        ],
        "question": {
          "prompt": "按钮目标暂未实现时，最合适的是？",
          "options": [
            {
              "text": "如实标状态或移除误导入口。",
              "correct": true,
              "feedback": "保持承诺与真实能力相符。"
            },
            {
              "text": "保持空按钮，期待用户不点击。",
              "correct": false,
              "feedback": "这会直接破坏主路径预期。"
            },
            {
              "text": "显示虚假的加载成功。",
              "correct": false,
              "feedback": "虚假成功会掩盖未实现功能。"
            }
          ]
        },
        "sources": [
          {
            "title": "W3C WAI · Easy Checks",
            "url": "https://www.w3.org/WAI/test-evaluate/easy-checks/"
          },
          {
            "title": "W3C WAI · Images Tutorial",
            "url": "https://www.w3.org/WAI/tutorials/images/"
          }
        ]
      }
    ]
  },
  {
    "slug": "web-interactions",
    "title": "让工具真的能用：从一个按钮到一整套练习流程",
    "category": "Vibe coding",
    "summary": "围绕一张本地出门条，把一个能点的按钮做成一套完整的练习流程：状态、事件、校验、可访问性与本地保存。",
    "outcome": "一个能预览、保存、恢复和删除假主题的本地小工具，以及完整路径检查记录。",
    "audience": {
      "who": "做得出静态页面、想让学生真的在页面上做点什么的老师或自学者",
      "pain": "我加的按钮点两下状态就对不上，学生刚填好的东西一刷新全没了。",
      "win": "一个能校验、保存、恢复和删除记录的小工具，加一份走通全部状态的检查记录。"
    },
    "prerequisite": "完成网页入门；能打开 HTML、修改少量 JavaScript，使用本地预览服务检查存储。",
    "conceptIds": [],
    "lessons": [
      {
        "id": "interaction-map",
        "figureKey": "web-layers",
        "title": "互动网页是一组状态与转移",
        "module": "理解行为",
        "minutes": 15,
        "conceptIds": [],
        "objective": "把按钮前后发生的变化写成可检查的状态表。",
        "paragraphs": [
          "静态网页主要呈现内容，互动网页会根据用户动作改变当前状态。状态是此刻页面需要记住的信息，例如提示开着还是关着、表单是否填写、记录是否保存。把这些信息写清楚，才能解释为什么同一个按钮在不同时刻结果不同。",
          "用课堂出门条做贯穿练习：老师输入活动主题，点击检查，看到可修改的预览，最后选择是否存到当前浏览器。先列空白、填写中、可预览、已保存和保存失败几种情况，再列动作如何让它们切换。",
          "状态表不是为了画得复杂，而是发现漏掉的路径。若只设计成功画面，空输入、重复点击或失败时就可能无话可说。本课程会逐步实现输入、校验、反馈、键盘操作和本地记录；不接收学生真实数据，也不向服务器发送内容。"
        ],
        "example": {
          "title": "按钮之前和之后",
          "text": "预测空输入点预览会不会应该成功；用纸卡走空白→输入→预览→修改四步，指出每步需要保留什么值。"
        },
        "task": "为虚构出门条画五个状态和三个动作，给每条转移写期望显示；用一条成功路径和一条失败路径检查。",
        "checklist": [
          "状态描述的是信息而非颜色。",
          "空值与失败路径明确。",
          "预览与保存不是同一状态。"
        ],
        "question": {
          "prompt": "把按钮变成绿色就能代表保存成功吗？",
          "options": [
            {
              "text": "能，绿色就是数据。",
              "correct": false,
              "feedback": "颜色是呈现，保存成功需要实际结果。"
            },
            {
              "text": "不能，需要依据保存结果更新状态。",
              "correct": true,
              "feedback": "状态与底层操作结果应一致。"
            },
            {
              "text": "只要加入动画就能。",
              "correct": false,
              "feedback": "动画不保证任何数据已写入。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · JS",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript"
          },
          {
            "title": "MDN · events",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events"
          }
        ]
      },
      {
        "id": "event-render",
        "figureKey": "web-layers",
        "title": "事件发生后，统一更新页面",
        "module": "理解行为",
        "minutes": 15,
        "conceptIds": [],
        "objective": "把数据变化与页面渲染连接起来，减少互相矛盾的显示。",
        "paragraphs": [
          "浏览器通过事件告诉程序用户做了什么，例如点击、输入和提交。处理事件的函数可以先改变数据，再调用一个集中更新显示的函数。渲染在这里就是根据当前数据，把文字、隐藏状态和按钮状态设置到页面。",
          "提示卡若同时在三个位置各自翻转开关，很容易出现按钮说收起但内容还在的情况。把一个布尔值作为展开状态的来源，再让渲染函数统一更新 hidden、文字和 aria-expanded，能减少多份状态相互偏离。",
          "集中更新不是任何项目都必须照搬的框架，而是小页面也能使用的整理方式。事件监听应在元素存在以后设置；找不到元素时先核对 ID 与脚本位置。修改后要点两次并用键盘再试，不能只检查第一次出现提示。"
        ],
        "example": {
          "title": "一个状态，三处显示",
          "text": "先预测只改按钮文字会留下哪处矛盾；将展开值分别映射到内容可见、标签和 aria-expanded，尝试两次切换并解释一致性。"
        },
        "task": "把现有提示卡整理成一个状态值和一个 render 函数；保留原功能，检查打开、收起与键盘操作。",
        "checklist": [
          "只有清楚的展开状态来源。",
          "多个显示由同一状态推导。",
          "事件绑定时元素已经存在。"
        ],
        "question": {
          "prompt": "怎样减少按钮文字与内容可见性的冲突？",
          "options": [
            {
              "text": "分别随意改变每个位置。",
              "correct": false,
              "feedback": "多处独立判断更容易不一致。"
            },
            {
              "text": "永远隐藏按钮。",
              "correct": false,
              "feedback": "隐藏按钮取消了用户切换提示的入口，却没有整理状态逻辑。"
            },
            {
              "text": "从同一个状态值更新相关显示。",
              "correct": true,
              "feedback": "让相关呈现共享明确依据。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · events",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events"
          },
          {
            "title": "MDN · DOM",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"
          }
        ]
      },
      {
        "id": "form-basics",
        "title": "表单：标签、输入与提交是一组",
        "module": "收集与校验输入",
        "minutes": 15,
        "conceptIds": [],
        "objective": "使用原生表单结构，让鼠标与键盘都能完成输入。",
        "paragraphs": [
          "表单是一组收集输入并提交处理的控件。label 为输入框提供可见名称，input 或 textarea 接收内容，button 触发动作。老师填写“活动主题”时，不应靠猜占位符含义或看旁边颜色才知道要填什么。",
          "让 label 的 for 对应输入框的 id，可以建立明确关联。处理 form 的 submit 事件，比只监听鼠标点按钮更完整，因为用户也可能按 Enter 提交。在这个本地原型中阻止默认提交导航，再在页面里显示预览。",
          "HTML 结构本身不会自动建立数据库，也不会把内容发给同事。你需要明确处理发生在哪里。练习中使用假主题“观察校园植物”，页面写明只在本地预览；这种边界说明能防止用户把表单外观误认成真正报名或收集系统。"
        ],
        "example": {
          "title": "不用鼠标也能提交吗？",
          "text": "先预测点按钮与输入后按 Enter 是否走同一逻辑；分别尝试，检查标签点击是否聚焦输入框，并解释 form 的作用。",
          "code": "<form id=\"activity-form\">\n  <label for=\"topic\">活动主题</label>\n  <input id=\"topic\" name=\"topic\" required>\n  <button type=\"submit\">本地预览</button>\n</form>\n<p id=\"preview\" role=\"status\">内容不会发送。</p>"
        },
        "task": "创建含一个主题输入框的表单，用 submit 处理显示预览；测试标签、Enter 和按钮三条路径。",
        "checklist": [
          "label 正确关联字段。",
          "提交逻辑覆盖键盘动作。",
          "页面说明数据没有发送。"
        ],
        "question": {
          "prompt": "只给按钮绑 click，可能遗漏什么？",
          "options": [
            {
              "text": "通过表单键盘提交的路径。",
              "correct": true,
              "feedback": "应围绕 submit 设计表单处理。"
            },
            {
              "text": "文字的字体颜色。",
              "correct": false,
              "feedback": "这是样式问题，不是事件入口。"
            },
            {
              "text": "所有 HTML 都会失效。",
              "correct": false,
              "feedback": "问题通常是行为路径覆盖不足。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · forms",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form"
          },
          {
            "title": "MDN · label",
            "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label"
          },
          {
            "title": "MDN · button",
            "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button"
          }
        ],
        "figureKey": "form-validation"
      },
      {
        "id": "validate",
        "title": "校验：告诉用户哪一处可以改",
        "module": "收集与校验输入",
        "minutes": 15,
        "conceptIds": [],
        "objective": "区分空值检查、格式校验与内容真实性。",
        "paragraphs": [
          "校验是检查输入是否符合当前处理要求，例如必填字段不能空着、长度不能超出约定。它帮助用户修正输入，不等于判断教学主题是否优秀，也不能证明邮箱属于填写者。格式正确与内容真实是不同问题。",
          "先用原生 required 等约束，再根据场景补自定义规则。主题输入只有空格时，程序可以 trim 后判断为空；提示应说“请写一个活动主题”，并把注意引向字段。错误发生后保留原输入，比一键清空更方便修正。",
          "客户端校验发生在浏览器，未来若有服务器接收，服务器仍需重新检查，因为浏览器规则可以被绕过。本地练习只验证空白、正常文字和过长输入三种情况；让每条规则都服务于明确用途，不为显得严格而随意限制用户表达。"
        ],
        "example": {
          "title": "空格算填写了吗？",
          "text": "预测输入三个空格能否通过只看长度的检查；比较原值与 trim 后结果，再说明为什么“有字符”不一定有有效内容。"
        },
        "task": "为主题字段定义空白与长度规则，写对应可修改提示；逐个测试三种输入，并确认错误后原文仍在。",
        "checklist": [
          "规则有清楚用途。",
          "空格与过长输入都试过。",
          "格式通过没有被称为事实审核。"
        ],
        "question": {
          "prompt": "一个邮箱满足格式，说明什么？",
          "options": [
            {
              "text": "一定是真实本人且可以联系。",
              "correct": false,
              "feedback": "格式检查不能验证身份与送达。"
            },
            {
              "text": "只满足当前格式规则，真实性需别的证据。",
              "correct": true,
              "feedback": "检查结论应限制在规则覆盖的范围。"
            },
            {
              "text": "不需要服务器再校验。",
              "correct": false,
              "feedback": "客户端规则不能替代服务端检查。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · validation",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation"
          }
        ],
        "figureKey": "form-validation"
      },
      {
        "id": "feedback-states",
        "figureKey": "web-layers",
        "title": "让等待、成功和失败都说实话",
        "module": "收集与校验输入",
        "minutes": 15,
        "conceptIds": [],
        "objective": "根据实际处理结果提供可行动反馈，并保留恢复路径。",
        "paragraphs": [
          "用户按下按钮以后，需要知道系统是否收到动作、还在处理，还是已经完成。反馈不仅是一句夸奖，还应该说明当前状态和下一步。表单保存失败时，说“请复制内容后重试”比只显示红叉更能让用户继续。",
          "如果操作需要时间，可以显示正在处理，并暂时避免重复提交；真正完成后才显示成功。不要用固定一秒的动画当作服务成功依据。演示加载流程时可以人为切换成功或失败，但必须注明是模拟，没有真实请求。",
          "状态文字应出现在用户能够找到的位置，必要时用 role=\"status\" 等语义让辅助技术感知更新。不要频繁打断输入。失败时保留内容、说明可重试条件；恢复后还要核对是否重复保存，避免视觉上恢复了而数据多了一份。"
        ],
        "example": {
          "title": "同一个按钮，三种结局",
          "text": "先预测加载动画结束是否意味着请求成功；用纸卡或演示开关选择成功与失败，观察反馈变化，解释结果依据与动画时间的区别。"
        },
        "task": "为预览或保存动作写处理中、成功、失败三条消息及下一步；模拟失败并确认输入保留，明确模拟性质。",
        "checklist": [
          "成功只由实际结果触发。",
          "失败后有可执行下一步。",
          "状态可被看见并被辅助技术理解。"
        ],
        "question": {
          "prompt": "请求失败后最有帮助的反馈是？",
          "options": [
            {
              "text": "成功完成，避免让用户担心。",
              "correct": false,
              "feedback": "虚假成功会造成数据与预期不一致。"
            },
            {
              "text": "未知错误，然后清空全部输入。",
              "correct": false,
              "feedback": "既没有恢复方法，也增加重复劳动。"
            },
            {
              "text": "未能保存，保留输入并说明复制或重试方法。",
              "correct": true,
              "feedback": "准确状态和恢复路径能帮助继续任务。"
            }
          ]
        },
        "sources": [
          {
            "title": "W3C WAI · Forms Tutorial",
            "url": "https://www.w3.org/WAI/tutorials/forms/"
          },
          {
            "title": "MDN · fetch",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
          }
        ]
      },
      {
        "id": "keyboard-access",
        "figureKey": "web-layers",
        "title": "可访问性从真实键盘路径开始",
        "module": "让更多人能用",
        "minutes": 15,
        "conceptIds": [],
        "objective": "验证焦点、标签与原生控件，避免把无鼠标用户挡在流程外。",
        "paragraphs": [
          "可访问性关注不同能力、设备与操作方式的人能否使用页面。键盘检查是一个实用起点：按 Tab 应能依次到达交互控件，焦点应清楚可见，按 Enter 或 Space 应按控件的原生规则触发动作。它不是最终的全部评估。",
          "使用真正的按钮、链接和表单控件，比给普通文字加点击事件更容易获得正确基础行为。展开提示时，aria-expanded 应与实际显示一致。只加 aria 属性却没有实现对应行为，不会自动变成可访问组件。",
          "从页面顶部走完整个出门条流程，检查错误出现后是否知道修改哪里、收起区域有没有留下不可见的焦点。还要检查对比、放大阅读与替代文字。自动工具和键盘走查各有覆盖范围，交付时写明检查过什么，不笼统宣称全面符合。"
        ],
        "example": {
          "title": "关掉鼠标之后",
          "text": "先预测能否不借助鼠标完成填写、预览和保存；按实际焦点顺序操作，记录一次卡住位置，并解释是元素角色还是焦点显示的问题。"
        },
        "task": "只用键盘走完整条主路径，修复一个不可达或焦点不清楚的位置；再放大页面检查文字与按钮。",
        "checklist": [
          "焦点可见且顺序合理。",
          "原生控件承担相应动作。",
          "没有把一次走查当完整认证。"
        ],
        "question": {
          "prompt": "给 div 加 aria-label 就自动具备按钮行为吗？",
          "options": [
            {
              "text": "不会，还缺键盘与语义行为，优先用 button。",
              "correct": true,
              "feedback": "可访问名称不是完整交互实现。"
            },
            {
              "text": "会，任何属性都会自动绑定按键。",
              "correct": false,
              "feedback": "ARIA 本身不实现事件行为。"
            },
            {
              "text": "会自动提交到服务器。",
              "correct": false,
              "feedback": "标签与网络请求没有这种关系。"
            }
          ]
        },
        "sources": [
          {
            "title": "W3C WAI · Easy Checks",
            "url": "https://www.w3.org/WAI/test-evaluate/easy-checks/"
          },
          {
            "title": "MDN · button",
            "url": "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button"
          }
        ]
      },
      {
        "id": "persistent-storage",
        "figureKey": "web-layers",
        "title": "本地存储：刷新后仍在，但只在这里",
        "module": "保存与维护记录",
        "minutes": 15,
        "conceptIds": [],
        "objective": "把保存操作与实际结果连接，理解同源与浏览器边界。",
        "paragraphs": [
          "普通变量在刷新后重新开始，本地存储可以让小量文字在同一站点的当前浏览器中继续存在。localStorage 以键和值保存字符串；键像记录的名字，值是保存内容。它不是账号系统，也不会自动同步到另一台设备。",
          "为出门条使用独立键，如 activity-draft-v1，保存前说明范围。读取和写入都可能失败，应使用 try/catch 捕获并给出真实提示。直接双击 file: 页面时存储行为没有统一保证，用本地 HTTP 地址更适合稳定检查。",
          "保存之后刷新并核对，再修改内容而不保存，观察刷新后恢复的是哪一版。删除只针对本工具的键，避免误伤同站其他记录。存储不是安全保险箱，也不适合本练习保存真实学生信息；当前目的只是理解记录生命周期。"
        ],
        "example": {
          "title": "保存前后刷新有什么不同？",
          "text": "先预测输入但未保存与保存后刷新各恢复什么；按两种路径测试，解释“界面里有字”和“已经写入存储”的区别。"
        },
        "task": "为假主题实现保存、读取和删除；测试未保存刷新、已保存刷新、删除刷新和失败提示，记录实际结果。",
        "checklist": [
          "保存成功依据写入结果。",
          "刷新恢复的是已保存版本。",
          "知道本地范围与失败情况。"
        ],
        "question": {
          "prompt": "换浏览器看不到草稿，最可能因为？",
          "options": [
            {
              "text": "草稿已被自动上传。",
              "correct": false,
              "feedback": "本例只操作浏览器存储，没有上传请求或云端同步服务。"
            },
            {
              "text": "记录仅在原浏览器的对应站点存储中。",
              "correct": true,
              "feedback": "本地保存与跨设备同步不同。"
            },
            {
              "text": "一定是用户记错主题。",
              "correct": false,
              "feedback": "应先检查存储位置而非责怪用户。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · localStorage",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
          },
          {
            "title": "MDN · storage",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API"
          }
        ]
      },
      {
        "id": "json-records",
        "figureKey": "web-layers",
        "title": "多条记录：先规定数据长什么样",
        "module": "保存与维护记录",
        "minutes": 15,
        "conceptIds": [],
        "objective": "用 JSON 保存结构化记录，并处理缺失或损坏的数据。",
        "paragraphs": [
          "主题、时间与备注属于同一条记录时，可以用对象把它们放在一起。localStorage 只保存字符串，因此需要 JSON.stringify 把对象转为文本，再用 JSON.parse 读回。JSON 是表达数据的格式，不是自动数据库或同步服务。",
          "读回的内容不能直接假定完整。旧版本可能缺少字段，手动修改也可能造成无效文本。先捕获解析错误，再检查是否有预期字段与类型；无法使用时给出恢复说明，不把坏记录继续传给页面导致整个交互停止。",
          "给记录加一个版本号，可以帮助未来知道该怎样解释旧数据。最初只需要少量字段和稳定 ID，不必把所有界面颜色都存进去。练习用假数据改坏一个字段，观察页面能否继续工作，并保留让用户复制或清除该记录的选择。"
        ],
        "example": {
          "title": "字符串能自动变回对象吗？",
          "text": "预测读取存储后能否直接访问主题字段；对照原字符串、解析结果与一段损坏 JSON，解释格式转换与字段检查的不同作用。"
        },
        "task": "设计含版本、主题和备注的记录，尝试正常读取与损坏数据；失败时保留页面可操作，明确处理办法。",
        "checklist": [
          "保存前转换为 JSON 文本。",
          "读取同时处理解析错误与字段缺失。",
          "有版本和稳定记录标识。"
        ],
        "question": {
          "prompt": "JSON.parse 成功就能认定记录字段全部有效吗？",
          "options": [
            {
              "text": "能，任何 JSON 都符合项目要求。",
              "correct": false,
              "feedback": "语法有效不等于字段与类型符合预期。"
            },
            {
              "text": "不能，还要检查需要的字段与类型。",
              "correct": true,
              "feedback": "解析和项目数据验证是两层检查。"
            },
            {
              "text": "它会自动修复所有旧数据。",
              "correct": false,
              "feedback": "迁移和默认值需要明确设计。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · JSON",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON"
          },
          {
            "title": "MDN · try",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch"
          }
        ]
      },
      {
        "id": "safe-preview",
        "figureKey": "web-layers",
        "title": "显示用户文字，不把它当程序执行",
        "module": "保存与维护记录",
        "minutes": 15,
        "conceptIds": [],
        "objective": "使用文本方式呈现输入，理解内容与代码的边界。",
        "paragraphs": [
          "用户输入的主题应该作为文字显示。如果把输入直接拼进 innerHTML，浏览器可能把其中的标记解释成页面结构，而不是原样呈现。即使只是教师自用原型，也应从一开始把数据与要执行的页面代码分开。",
          "对于主题预览，textContent 足以把字符串放进元素。输入“<b>观察植物</b>”时，预期看到这些字符本身，而不是加粗效果。这样也更容易说明：预览展示的是用户原文，并没有给用户任意改写页面结构的能力。",
          "若未来确实需要富文本，应单独采用经过考虑的解析与清理方案，不能因为要加粗几个字就开放任意 HTML。也不要把网页上显示的字符串交给 eval 之类执行。当前小工具只展示纯文本，简单边界能减少不必要的实现风险。"
        ],
        "example": {
          "title": "尖括号是文字还是标签？",
          "text": "先预测同一段假输入放进 textContent 和 HTML 解释位置的差异；本课只实现 textContent 预览，检查尖括号原样出现。",
          "code": "const topic = document.querySelector(\"#topic\");\nconst preview = document.querySelector(\"#preview\");\npreview.textContent = topic.value;"
        },
        "task": "用 textContent 显示假主题，分别试普通中文、尖括号和长段落；确认没有额外元素被输入创建。",
        "checklist": [
          "输入按文本呈现。",
          "没有把输入交给执行函数。",
          "富文本被识别为另外的功能需求。"
        ],
        "question": {
          "prompt": "纯文本主题预览优先使用？",
          "options": [
            {
              "text": "把用户输入直接拼到 innerHTML。",
              "correct": false,
              "feedback": "这会让输入进入 HTML 解释路径。"
            },
            {
              "text": "eval 用户输入。",
              "correct": false,
              "feedback": "主题不是需要执行的程序。"
            },
            {
              "text": "为预览元素设置 textContent。",
              "correct": true,
              "feedback": "适合安全地显示纯文本内容。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · textContent",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent"
          }
        ]
      },
      {
        "id": "interaction-checklist",
        "figureKey": "refactor",
        "title": "用状态路径验收完整小工具",
        "module": "保存与维护记录",
        "minutes": 15,
        "conceptIds": [],
        "objective": "覆盖首次、错误、重复、刷新与删除，交付可复查记录。",
        "paragraphs": [
          "互动网页的质量要在不同状态之间检查，而不只看初始截图。以出门条为例，首次打开、空值提交、有效预览、再次修改、保存、刷新、删除，都可能执行不同代码。把这些路径写成步骤，才知道哪些真的试过。",
          "每条记录包括输入、动作、期望和实际结果。发现问题先找最短重现路径，一次修一个原因，再重测相关旧行为。比如修好空输入后，还要确认正常中文主题仍能预览，避免规则变得过严。",
          "交付时附上运行方式、当前数据位置和未实现能力：无账号、无云同步、无真实发送。再请不了解代码的人按说明做一个任务，观察哪里需要补解释。这些记录能支持“主路径已检查”，不能自动支持所有浏览器或全部可访问性要求。"
        ],
        "example": {
          "title": "一次成功能覆盖多少路径？",
          "text": "先预测空输入、保存后刷新与删除后刷新三条路径。将下面完整代码保存为 index.html，用本地 HTTP 预览服务打开，再逐条验证。它只保存一个假主题，不发送数据，不调用模型；损坏记录会给出提示。",
          "code": "<!doctype html>\n<html lang=\"zh-CN\">\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n<title>本地出门条主题草稿</title>\n<style>body{max-width:42rem;margin:2rem auto;padding:1rem;font:18px/1.7 sans-serif}input,button{font:inherit;max-width:100%;box-sizing:border-box}button{margin:.4rem}:focus-visible{outline:3px solid #6248a5;outline-offset:3px}#preview{overflow-wrap:anywhere}</style>\n<main>\n<h1>本地出门条主题草稿</h1>\n<p>只用虚构主题。草稿仅保存在当前浏览器，内容不会发送。</p>\n<form id=\"form\">\n<label for=\"topic\">活动主题（1—80 个字符）</label><br>\n<input id=\"topic\" name=\"topic\" required maxlength=\"80\" aria-describedby=\"help error\">\n<p id=\"help\">例如：观察校园植物。请勿填写学生个人信息。</p>\n<p id=\"error\" role=\"alert\"></p>\n<button type=\"submit\">预览并保存到此浏览器</button>\n<button id=\"clear\" type=\"button\">删除本工具草稿</button>\n</form>\n<h2>已保存的主题</h2><p id=\"preview\">暂无草稿</p>\n<p id=\"status\" role=\"status\"></p>\n</main>\n<script>\nconst key = \"activity-draft-v1\";\nconst form = document.querySelector(\"#form\");\nconst topic = document.querySelector(\"#topic\");\nconst preview = document.querySelector(\"#preview\");\nconst status = document.querySelector(\"#status\");\nconst error = document.querySelector(\"#error\");\ntry {\n  const raw = localStorage.getItem(key);\n  if (raw !== null) {\n    const data = JSON.parse(raw);\n    if (!data || data.version !== 1 || typeof data.topic !== \"string\" || !data.topic.trim() || data.topic.length > 80) throw new Error(\"Invalid draft\");\n    topic.value = data.topic;\n    preview.textContent = data.topic;\n    status.textContent = \"已恢复此浏览器的草稿。\";\n  }\n} catch { status.textContent = \"无法读取草稿。仍可练习，也可尝试删除本工具草稿。\"; }\nform.addEventListener(\"submit\", (event) => {\n  event.preventDefault();\n  const value = topic.value.trim();\n  error.textContent = \"\";\n  topic.removeAttribute(\"aria-invalid\");\n  if (!value || value.length > 80) {\n    error.textContent = \"请填写 1—80 个字符的活动主题。\";\n    topic.setAttribute(\"aria-invalid\", \"true\");\n    topic.focus();\n    return;\n  }\n  try {\n    localStorage.setItem(key, JSON.stringify({version: 1, topic: value}));\n    preview.textContent = value;\n    status.textContent = \"已保存到此浏览器，未发送或同步。\";\n  } catch { status.textContent = \"未能保存。输入仍保留，请复制到自己的笔记。\"; }\n});\ndocument.querySelector(\"#clear\").addEventListener(\"click\", () => {\n  try {\n    localStorage.removeItem(key);\n    topic.value = \"\";\n    preview.textContent = \"暂无草稿\";\n    error.textContent = \"\";\n    topic.removeAttribute(\"aria-invalid\");\n    status.textContent = \"已删除本工具草稿。\";\n  } catch { status.textContent = \"删除失败，请检查浏览器存储设置。\"; }\n});\n</script>\n</html>"
        },
        "task": "运行至少六条不同状态路径并写真实结果，修复最影响主任务的一项，再交付页面与检查记录。",
        "checklist": [
          "测试包含失败及恢复。",
          "修复后重测已有行为。",
          "交付说明准确表达覆盖范围。"
        ],
        "question": {
          "prompt": "修复校验后只测空值，遗漏了什么？",
          "options": [
            {
              "text": "正常输入与后续保存等回归路径。",
              "correct": true,
              "feedback": "新规则也可能影响原来正常的流程。"
            },
            {
              "text": "没有遗漏，因为报错出现就行。",
              "correct": false,
              "feedback": "错误路径正常不保证成功路径可用。"
            },
            {
              "text": "只需要再改一次颜色。",
              "correct": false,
              "feedback": "配色不是行为回归检查。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · debug",
            "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript"
          },
          {
            "title": "W3C WAI · Easy Checks",
            "url": "https://www.w3.org/WAI/test-evaluate/easy-checks/"
          }
        ]
      }
    ]
  },
  {
    "slug": "github-starter",
    "title": "Git 与 GitHub：改坏了能退回去，做好了能交出去",
    "category": "Vibe coding",
    "summary": "先在自己电脑上把每次改动存成可以回去的版本，再把仓库放上 GitHub，用 Issue 与 PR 和别人改同一个项目。",
    "outcome": "一个本地练习仓库（有提交、分支、合并与回退记录），以及一个 GitHub 练习仓库（有 README、Issue、PR 与交接报告）。",
    "audience": {
      "who": "一个人边做边改文件、改到不敢删、只能堆出一排「最终版」的创作者",
      "pain": "我改坏了就回不去，桌面上堆着一排「最终版 2」，也不敢让别人碰我的文件。",
      "win": "一个能逐条看懂改动、随时退回上一个可用版本的仓库，以及一次被人看过的改动记录。"
    },
    "prerequisite": "已安装 Git，能打开终端和文本编辑器。第 7 节起需要一个个人 GitHub 账号。全程在新建的练习目录和你自己的虚构示例里操作。",
    "conceptIds": [],
    "lessons": [
      {
        "id": "why-versions",
        "figureKey": "github-flow",
        "title": "为什么项目需要版本记录",
        "module": "先把改动存起来",
        "minutes": 15,
        "conceptIds": [],
        "objective": "区分文件保存、版本记录与云端共享。",
        "paragraphs": [
          "给文件起“教案最终版二真的最终版”之类的名字，暂时能找回旧稿，却很难知道每次改了什么。Git 是记录文件变化的工具：你选择一个时刻留下版本，并写下这次变化的意思。它特别适合文字和代码，能把前后差别展示出来。",
          "GitHub 是托管仓库与协作的网站；Git 则可以完全在本地工作。没有 GitHub 账号，也能为课堂活动网页建立提交记录。编辑器的保存让文件落到磁盘，Git 的提交让选定内容进入版本历史，两者解决的问题不同。",
          "本课程用全新的练习文件夹，避免在正式教案或网站上试命令。先做一份只有 README 的项目，逐步学习查看、提交、分支、合并与撤销。学会以后，你可以回答“这次为什么改”“上一版是什么”，并把一个实验放在可检查的位置。"
        ],
        "example": {
          "title": "最终版文件夹的困境",
          "text": "预测两份同名教案隔一周后能否看出修改理由；手工对照两行文字，再观察 Git 差异会呈现的增删。解释版本内容和改动说明为何都需要。"
        },
        "task": "新建名为 git-practice 的空文件夹，写三行活动说明；另写一句最希望版本记录帮你回答的问题。",
        "checklist": [
          "能区分 Git 与 GitHub。",
          "练习目录与正式项目分开。",
          "知道保存尚不等于提交。"
        ],
        "question": {
          "prompt": "不联网时，Git 能做什么？",
          "options": [
            {
              "text": "记录本地提交与查看历史。",
              "correct": true,
              "feedback": "本地仓库保存版本不依赖 GitHub。"
            },
            {
              "text": "自动把教案分享给同事。",
              "correct": false,
              "feedback": "分享需要明确远端或其他交付方式。"
            },
            {
              "text": "只能打开 GitHub 页面。",
              "correct": false,
              "feedback": "Git 是本地也可使用的版本工具。"
            }
          ]
        },
        "sources": [
          {
            "title": "Git · basics",
            "url": "https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F"
          }
        ]
      },
      {
        "id": "snapshot",
        "title": "工作区、暂存区、提交",
        "minutes": 12,
        "conceptIds": [],
        "objective": "理解一次提交到底保存了哪一版文件。",
        "paragraphs": [
          "Git 记录项目版本。工作区是正在编辑的文件；暂存区是你为下一次提交选出的内容；提交是在仓库中保存的一次快照。保存文件不等于 git add，git add 也不等于 commit。",
          "先在全新文件夹练习。运行 git --version 检查安装。git init 建立仓库；接着用编辑器新建 README.md，写下练习工具的用途。运行下面的命令，逐步观察文件从未跟踪到已暂存的变化。",
          "提交只在本地保存，并不会自动发布到 GitHub。若 Git 提示缺少身份，可仅为当前练习仓库配置 user.name 和 user.email；邮箱会写入提交元数据，应使用你愿意公开的地址或平台提供的隐私地址。",
          "你可以把暂存区想成提交前的待交清单，但清单保存的是加入当时的内容：之后继续编辑不会自动进入它。用两个差异视图对照，比只记三个术语更能判断将提交哪一版。"
        ],
        "example": {
          "title": "每一步都先看状态",
          "text": "在新练习文件夹执行 git init，用编辑器保存 README.md 后执行以下命令。git diff --staged 展示即将提交的内容。",
          "code": "git status\ngit add README.md\ngit diff --staged\ngit commit -m \"Describe the learning activity\"\ngit log --oneline"
        },
        "task": "创建第一条提交。用自己的话解释：如果 git add 后又编辑 README.md，新修改会自动进入这次提交吗？再用 git diff 与 git diff --staged 对照检查。",
        "checklist": [
          "我确认命令运行在练习目录。",
          "提交前读过暂存差异，里面没有密码、密钥或学生资料。",
          "能在 git log 中找到自己的提交。"
        ],
        "question": {
          "prompt": "git add README.md 后又修改了该文件，此时直接 commit 会保存什么？",
          "options": [
            {
              "text": "暂存时的版本。",
              "correct": true,
              "feedback": "对。新编辑的部分仍在工作区；若也要提交，需要再次 add。"
            },
            {
              "text": "编辑器里最新保存的全部内容。",
              "correct": false,
              "feedback": "Git 提交暂存区的内容，不会自动重新暂存后来的编辑。"
            },
            {
              "text": "自动上传到 GitHub 的版本。",
              "correct": false,
              "feedback": "commit 是本地操作；推送到远端是另一步。"
            }
          ]
        },
        "sources": [
          {
            "title": "Pro Git · Recording Changes",
            "url": "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository"
          },
          {
            "title": "Git · git-add",
            "url": "https://git-scm.com/docs/git-add"
          }
        ],
        "module": "先把改动存起来",
        "figureKey": "git-flow"
      },
      {
        "id": "review",
        "title": "一次提交，只讲一个变化",
        "minutes": 12,
        "conceptIds": [],
        "objective": "检查差异、撤销暂存，留下能读懂的改动理由。",
        "paragraphs": [
          "在 README.md 添加“适合谁”和“不适合什么情境”。用 git diff 查看尚未暂存的修改。每次提交围绕一个能够解释的变化；这会让以后定位问题更容易。",
          "如果只是暂存错了文件，可以运行 git restore --staged README.md，把它从下一次提交中撤出。这个带 --staged 的命令保留工作区编辑。不要把它与不带 --staged 的 restore 混为一谈，后者可能丢弃工作区改动。",
          "新建 .gitignore，写入 .env 和 .env.* 可帮助避免之后把这些未跟踪文件加入仓库。它不自动移除已跟踪文件，也不能撤回已经泄露的秘密。练习中不需要任何真实密钥。",
          "差异里的新增和删除，是相对比较对象的变化。先预测撤销暂存后文件文字是否还在，再执行并观察：改变的是下一次提交的候选内容，不是刚才在编辑器写下的句子。"
        ],
        "example": {
          "title": "看清楚，再留下记录",
          "text": "先暂存，再练习只撤销暂存。确认 README.md 中的新文字仍在，最后重新暂存并提交。",
          "code": "git diff\ngit add README.md\ngit diff --staged\ngit restore --staged README.md\ngit status\ngit add README.md\ngit commit -m \"Clarify who the activity supports\""
        },
        "task": "完成第二条提交。用 git show --stat 查看最近一次提交的文件范围，再用 git show 阅读实际差异，确认标题准确描述了变化。",
        "checklist": [
          "这次提交可以用一句话解释。",
          "理解撤销暂存与丢弃编辑的区别。",
          "提交中只包含我想记录的文件。"
        ],
        "question": {
          "prompt": "你只想把文件从暂存区撤出，并保留编辑，应该选择哪个？",
          "options": [
            {
              "text": "git restore --staged README.md",
              "correct": true,
              "feedback": "对。此处你已经有初始提交，它会恢复暂存区状态而保留工作区文件。"
            },
            {
              "text": "直接删除 README.md",
              "correct": false,
              "feedback": "删除文件并不是撤销暂存，还会增加新的工作区变化。"
            },
            {
              "text": "git restore README.md",
              "correct": false,
              "feedback": "这可能覆盖尚未暂存的编辑；与保留工作区的目标不符。"
            }
          ]
        },
        "sources": [
          {
            "title": "Git · git-restore",
            "url": "https://git-scm.com/docs/git-restore"
          },
          {
            "title": "Git · gitignore",
            "url": "https://git-scm.com/docs/gitignore"
          }
        ],
        "module": "先把改动存起来",
        "figureKey": "git-flow"
      },
      {
        "id": "branch",
        "figureKey": "github-flow",
        "title": "给一次实验一个名字",
        "minutes": 12,
        "conceptIds": [],
        "objective": "使用分支隔开已经提交的实验，并理解本地与远端的边界。",
        "paragraphs": [
          "分支是指向一系列提交的可移动名称，不是复制整个项目文件夹。先用 git status 确认练习目录干净，再用 git branch --show-current 记下原分支名。",
          "创建 experiment/instructions 分支后，改写 README 的说明并提交。切回刚才记下的原分支，你会看到原版本。只有已提交的版本才能这样可靠地回访；不要依赖切换分支替你保存未提交的工作。",
          "GitHub 等平台可以保存远端仓库并支持评审，但这个练习不需要远端。推送前要确认目标、访问权限和要公开的内容；下载别人的仓库也不等于获得任意使用权限，要查看许可证。",
          "在图里先预测切换分支会改变哪条已提交的历史，再用练习仓库核对。图把分支画成路线便于理解，实际 Git 使用引用指向提交；未提交编辑不能据此被当成已安全存档。"
        ],
        "example": {
          "title": "命名、修改、比较",
          "text": "执行前两行后，在编辑器修改 README.md。最后一行把 <原分支名> 替换成你实际记下的名字，不要原样输入尖括号。",
          "code": "git branch --show-current\ngit switch -c experiment/instructions\ngit add README.md\ngit commit -m \"Try a shorter activity introduction\"\ngit log --oneline --all --decorate\ngit switch <原分支名>"
        },
        "task": "比较原分支与实验分支的 README。写下你会保留哪个说明以及原因；本课无需合并、推送或删除任何分支。",
        "checklist": [
          "切换前确认没有未提交改动。",
          "能在两个分支中找到各自版本。",
          "知道本地提交与公开发布是两件事。"
        ],
        "question": {
          "prompt": "完成这三课的本地提交后，你的文件是否已经公开？",
          "options": [
            {
              "text": "是，Git 自动上传所有提交。",
              "correct": false,
              "feedback": "Git 不会因为 commit 就自动上传。"
            },
            {
              "text": "否，尚未配置并推送到公开远端。",
              "correct": true,
              "feedback": "对。版本记录已存在于本地；发布、权限与远端同步需要另外检查。"
            },
            {
              "text": "只要创建分支，就会生成公开网页。",
              "correct": false,
              "feedback": "分支是在仓库中命名提交路径，不会自动建立远端或网站。"
            }
          ]
        },
        "sources": [
          {
            "title": "Git · Basic Branching and Merging",
            "url": "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging"
          }
        ],
        "module": "放心做实验，也退得回来"
      },
      {
        "id": "merge",
        "figureKey": "github-flow",
        "title": "把通过检查的实验合回来",
        "module": "放心做实验，也退得回来",
        "minutes": 15,
        "conceptIds": [],
        "objective": "在干净练习仓库合并分支，并重新验证合并结果。",
        "paragraphs": [
          "分支让实验有独立的名字，合并则把另一条分支的变化接到当前分支。它不是选一个文件夹复制覆盖另一个文件夹，而是让 Git 根据共同历史组合变化。执行前先确认当前分支，因为合并结果会落在这里。",
          "沿用 experiment/instructions：先确认实验已提交、工作区干净，再切回记下的原分支，运行 git merge experiment/instructions。如果原分支没有新的分叉提交，可能只把分支指针向前移动，这叫快进；不必每次都出现新的合并提交。",
          "合并成功只表示 Git 完成了版本组合，不代表文案准确或页面正常。重新打开活动，检查标题、提示与按钮。暂时保留实验分支便于对照，等理解结果后再决定清理。若状态显示未提交修改，先停下并确认归属，不强行让命令替你处理。",
          "两条分支改了同一处时，Git 会停下来，在文件里同时标出两边的内容，等你决定。冲突是一道需要人判断的题：先读懂两边各想表达什么，保留其中一边或写出合并后的说法，删掉标记行，再提交这次判断。命令不会替你选出哪句话更准确。"
        ],
        "example": {
          "title": "两条线重新汇合",
          "text": "预测原分支在合并前是否已经含有实验文案；依次查看合并前后 README 与日志，解释本次快进为何没有额外合并节点。",
          "code": "git status\ngit branch --show-current\n# 先切回你记录的原分支，再执行下一行\ngit merge experiment/instructions\ngit log --oneline --graph --all -8"
        },
        "task": "在干净练习目录把已检查的实验合回原分支，记录合并前后内容与一次人工检查结果。",
        "checklist": [
          "执行前知道当前分支。",
          "工作区干净且实验已提交。",
          "合并后检查了内容本身。",
          "若出现冲突，写下你保留了哪一边以及理由；没有出现冲突也记一句。"
        ],
        "question": {
          "prompt": "合并命令成功后还要做什么？",
          "options": [
            {
              "text": "认定教学内容自动正确。",
              "correct": false,
              "feedback": "版本组合不审核学科内容。"
            },
            {
              "text": "检查文件与原有功能是否仍符合预期。",
              "correct": true,
              "feedback": "Git 的成功与产品行为正确是不同检查。"
            },
            {
              "text": "立即删除全部历史。",
              "correct": false,
              "feedback": "历史仍是定位与恢复的依据。"
            }
          ]
        },
        "sources": [
          {
            "title": "Git · merge",
            "url": "https://git-scm.com/docs/git-merge"
          }
        ]
      },
      {
        "id": "undo",
        "figureKey": "github-flow",
        "title": "先分清撤销哪一层",
        "module": "放心做实验，也退得回来",
        "minutes": 15,
        "conceptIds": [],
        "objective": "区分撤销暂存、丢弃编辑和反向提交，并选择保留历史的回退。",
        "paragraphs": [
          "“撤销”可能指三件不同的事：把文件撤出下一次提交、丢弃尚未提交的编辑、或抵消已经提交的变化。它们影响的层不同，风险也不同。执行前先看 git status 与差异，把想保留的内容说明白。",
          "带 --staged 的 restore 用于调整暂存内容，通常保留工作区编辑；不带它的 restore 可能覆盖未提交的编辑。已经共享的一条普通提交若有问题，可以使用 revert 创建一个新的反向提交，让历史仍能解释原改动与撤回原因。",
          "本课只在干净练习仓库撤回最近一条普通提交，不处理合并提交或强行重写历史。先用 git show 确认目标，再执行 git revert --no-edit HEAD，最后核对文件与日志。反向修改也可能冲突，不能把回退按钮想象成永远无需判断的时光机。"
        ],
        "example": {
          "title": "撤回实验仍留下理由",
          "text": "预测 revert 后日志里原提交是否消失；执行练习后比较内容与历史，解释为什么文件恢复了而原记录还在。",
          "code": "git status\ngit show --stat HEAD\n# 仅用于已确认的普通练习提交，且工作区干净\ngit revert --no-edit HEAD\ngit log --oneline -3"
        },
        "task": "选择一条自己的普通练习提交，记录撤回前内容，创建反向提交并核对；说明为何这比删除文件更清楚。",
        "checklist": [
          "目标提交和工作区状态已确认。",
          "知道丢弃编辑可能无法找回。",
          "回退后重新检查内容与历史。"
        ],
        "question": {
          "prompt": "希望抵消已共享提交，同时保留可追踪历史，优先理解哪种操作？",
          "options": [
            {
              "text": "创建反向提交 revert。",
              "correct": true,
              "feedback": "新提交记录撤回动作，旧记录仍可审阅。"
            },
            {
              "text": "直接把整个仓库删除。",
              "correct": false,
              "feedback": "这会丢失工作环境，也无法清楚说明撤回。"
            },
            {
              "text": "把 restore 当作所有撤销的统一命令。",
              "correct": false,
              "feedback": "不同参数和层级的影响不同。"
            }
          ]
        },
        "sources": [
          {
            "title": "Git · restore",
            "url": "https://git-scm.com/docs/git-restore"
          },
          {
            "title": "Git · revert",
            "url": "https://git-scm.com/docs/git-revert"
          }
        ]
      },
      {
        "id": "account-platform",
        "figureKey": "github-flow",
        "title": "GitHub 是协作平台，账号是你的身份",
        "module": "把仓库放到 GitHub 上",
        "minutes": 15,
        "conceptIds": [],
        "objective": "区分本地版本工具、平台账号与仓库权限。",
        "paragraphs": [
          "GitHub 是保存远端仓库、讨论问题和审阅修改的平台。Git 是本地记录版本的工具，二者常一起使用，但不是同一个东西。注册 GitHub 不会自动把电脑文件上传，安装 Git 也不等于已经获得某个仓库的修改权限。",
          "个人账号让平台知道是谁提出问题、提交修改或参与评审。组织是多人管理项目的空间；仓库可以属于个人或组织。看见一个公开仓库通常能阅读它，但直接写入仍取决于授权，不能把“看得到”理解为“可以随意改”。",
          "这门课用你自己拥有的练习仓库，放一份虚构阅读活动。先完成平台提示的账户验证与安全设置，再熟悉个人主页和仓库入口。学完后你会把一次教案改动放进可讨论、可审阅的协作流程，并能向接手的人交代当前状态。"
        ],
        "example": {
          "title": "账号、仓库、电脑三张卡",
          "text": "预测退出 GitHub 后本地提交是否消失；把“身份”“共享项目”“本地记录”分别对应账号、仓库与 Git，解释它们的连接而非混为一个东西。"
        },
        "task": "若已有账号就检查个人主页；否则按官方指引创建账号。画出本地目录、平台仓库和账号的关系，不记录密码或验证码。",
        "checklist": [
          "能区分 Git 与 GitHub。",
          "理解读取与写入权限不同。",
          "练习材料不包含真实学生数据。"
        ],
        "question": {
          "prompt": "安装 Git 后，是否自动有 GitHub 账号？",
          "options": [
            {
              "text": "是，安装时会自动公开全部文件。",
              "correct": false,
              "feedback": "安装工具不会自动注册或发布。"
            },
            {
              "text": "否，平台账号需要单独建立。",
              "correct": true,
              "feedback": "本地版本工具与平台身份是不同层。"
            },
            {
              "text": "账号就是电脑文件夹名称。",
              "correct": false,
              "feedback": "账号标识平台身份，目录只是本地位置。"
            }
          ]
        },
        "sources": [
          {
            "title": "GitHub Docs · account",
            "url": "https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github"
          },
          {
            "title": "GitHub Docs · repo",
            "url": "https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories"
          }
        ]
      },
      {
        "id": "fork-clone",
        "figureKey": "github-flow",
        "title": "Fork 与 clone：副本放在哪里",
        "module": "把仓库放到 GitHub 上",
        "minutes": 15,
        "conceptIds": [],
        "objective": "区分平台派生仓库和电脑上的本地副本。",
        "paragraphs": [
          "Fork 是在 GitHub 上建立与上游项目有关联的派生仓库，通常放到你有管理权的账号下。Clone 则把一个仓库复制到电脑，带上版本历史与远端信息。两者的关键差别是副本的位置和用途，不是英文名字谁更高级。",
          "若要为没有写权限的公开活动库提出改进，可以先 fork，再把自己的 fork clone 到电脑修改；若你已有团队仓库写权限，往往直接 clone 后开分支就够了。是否需要 fork 取决于协作方式和平台设置。",
          "克隆完成并不会自动同步未来所有变化，fork 也不会让你的修改立刻进入原项目。后续仍要获取更新、提交、推送并提出评审。下载 ZIP 适合只看文件，却通常没有可直接继续协作的完整 Git 历史；不要把三种取得文件方式混称为备份。"
        ],
        "example": {
          "title": "平台副本与桌面副本",
          "text": "先预测断网后哪份副本仍能编辑；用纸画上游仓库→个人 fork→本地 clone，标明每一步的地点。只在自己的练习仓库试 clone。",
          "code": "git clone <你自己的练习仓库地址>\n# 进入克隆生成的目录后执行\ngit remote -v"
        },
        "task": "在仓库页面找到 clone 地址并复制到新的本地目录；核对 origin，写出 fork 与 clone 各自解决的问题。",
        "checklist": [
          "能指出三份副本分别在哪里。",
          "知道 clone 后更新仍需同步。",
          "修改前检查了远端目标。"
        ],
        "question": {
          "prompt": "Fork 后改了自己的 README，原作者的仓库会怎样？",
          "options": [
            {
              "text": "自动被覆盖。",
              "correct": false,
              "feedback": "派生仓库的变化不会自动写进上游。"
            },
            {
              "text": "原仓库被删除。",
              "correct": false,
              "feedback": "Fork 并不移走原项目。"
            },
            {
              "text": "通常仍保持原样，需另行提出并接受修改。",
              "correct": true,
              "feedback": "上游接收是独立的协作决定。"
            }
          ]
        },
        "sources": [
          {
            "title": "GitHub Docs · fork",
            "url": "https://docs.github.com/en/pull-requests/reference/forks"
          },
          {
            "title": "GitHub Docs · clone",
            "url": "https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository"
          }
        ]
      },
      {
        "id": "remote-sync",
        "title": "提交留在本地，推送才到远端",
        "module": "把仓库放到 GitHub 上",
        "minutes": 15,
        "conceptIds": [],
        "objective": "理解 commit、push、fetch 的边界，先核对远端再共享。",
        "paragraphs": [
          "本地提交保存电脑仓库里的版本，push 把指定分支的提交发送到远端仓库。origin 只是常用的远端别名，不保证指向你的账号；从别人项目克隆时尤其要看实际地址。推送前先确认仓库、分支与准备共享的内容。",
          "fetch 获取远端的新记录，供你查看差异，不会直接把当前工作区替换成对方版本。pull 通常把获取与后续整合放在一起，具体方式受参数与配置影响。刚开始协作时先理解这两步，遇到分叉不要盲目点击强制推送。",
          "在练习仓库创建 docs/intro 分支，提交一处 README 澄清后推送该分支。若平台要求认证，按官方流程操作，不把令牌写入代码。刷新网页检查目标分支的文件与提交，才有证据说明本次变化确实到达了远端。"
        ],
        "example": {
          "title": "箭头何时真正越过网络？",
          "text": "预测 commit 后另一台电脑是否能看到新内容；提交前后看平台页面，再推送并刷新，解释本地记录和远端同步的差别。"
        },
        "task": "为自己的练习仓库推送一条文档分支，记录远端地址、分支名及网页上看到的提交；权限不足时记录原因，不绕过权限。",
        "checklist": [
          "推送前核对 origin 的实际地址。",
          "只共享已审阅的练习内容。",
          "在平台目标分支验证到达。"
        ],
        "question": {
          "prompt": "fetch 后当前文件没变，是否一定失败？",
          "options": [
            {
              "text": "不是，fetch 主要获取远端记录供后续整合。",
              "correct": true,
              "feedback": "获取与修改当前分支是可以分开的。"
            },
            {
              "text": "是，必须立即强制推送。",
              "correct": false,
              "feedback": "文件未变可能符合 fetch 的正常行为。"
            },
            {
              "text": "说明全部本地提交都丢失。",
              "correct": false,
              "feedback": "不能从文件未变推断历史丢失。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · fetch",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
          },
          {
            "title": "Git · push",
            "url": "https://git-scm.com/docs/git-push"
          },
          {
            "title": "Git · remote",
            "url": "https://git-scm.com/docs/git-remote"
          }
        ],
        "figureKey": "github-flow"
      },
      {
        "id": "issue",
        "figureKey": "github-flow",
        "title": "Issue：把一个问题讲到别人能行动",
        "module": "和别人改同一个项目",
        "minutes": 15,
        "conceptIds": [],
        "objective": "写出带复现、期望与范围的问题记录。",
        "paragraphs": [
          "Issue 是仓库里跟踪问题、需求或任务的讨论条目。它不是代码修改本身，也不是给维护者自动派发的命令。一个清楚的 Issue 能让协作者知道要处理什么、为什么值得做、怎样算完成。",
          "比如“阅读活动打不开提示”太模糊。可以写环境、打开哪个页面、按了什么、期望出现什么、实际看到什么。若是需求，写具体使用场景与边界，例如“让键盘用户展开提示”，而不是一次要求整个网站重做。",
          "提交前先搜索是否已有相同问题，并检查截图是否含学生姓名或私密地址。练习只在自己的仓库创建条目。处理过程中把新发现补进讨论，完成后关联具体修改和检查结果；关闭 Issue 表示跟踪状态结束，不代表所有用户情境都被证明无误。"
        ],
        "example": {
          "title": "从“坏了”到可复现",
          "text": "预测同事仅凭“提示坏了”能否重现；按你补写的三步操作走一遍，删掉与复现无关的内容，解释哪条信息最关键。"
        },
        "task": "在自己练习仓库写一个 Issue：背景、步骤、期望、实际、验收；用虚构页面问题，不去外部仓库测试发帖。",
        "checklist": [
          "一条 Issue 聚焦一个问题。",
          "别人能依描述执行检查。",
          "材料不含真实个人数据。"
        ],
        "question": {
          "prompt": "哪条 Issue 最可行动？",
          "options": [
            {
              "text": "这个项目不够智能。",
              "correct": false,
              "feedback": "缺少明确情境和可完成的目标。"
            },
            {
              "text": "键盘展开提示无反应，附步骤、环境和期望结果。",
              "correct": true,
              "feedback": "它能指导重现、定位与验收。"
            },
            {
              "text": "快点修所有错误。",
              "correct": false,
              "feedback": "范围不可控，也无法知道何时完成。"
            }
          ]
        },
        "sources": [
          {
            "title": "GitHub Docs · issues",
            "url": "https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues"
          }
        ]
      },
      {
        "id": "pull-request",
        "figureKey": "github-flow",
        "title": "PR：把改动放到合并前讨论",
        "module": "和别人改同一个项目",
        "minutes": 15,
        "conceptIds": [],
        "objective": "解释来源分支、目标分支与审阅范围，并提交可检查说明。",
        "paragraphs": [
          "Pull Request 常简称 PR，是请求把一组分支变化整合到目标分支的协作入口。它展示前后差异、讨论与检查状态，不是“下载文件”的按钮，也不等于已经合并。提出者可以先让别人看方案，再继续修订。",
          "建立 PR 时核对来源与目标：例如自己的 docs/intro 到练习仓库的默认分支。打开差异页，确认只含预期的说明改动；写清解决什么问题、怎么修改、怎样验证。标题“优化”不如“说明阅读活动的三步开始方法”。",
          "如果工作尚未完成，可以按平台支持的方式标成草稿或在描述中明确状态。评审者提出意见后，你把后续提交推到同一来源分支，PR 会反映这些变化。合并前应重新检查最新版本，而不是只相信最初那次通过的结果。"
        ],
        "example": {
          "title": "PR 里究竟比较谁？",
          "text": "预测目标选成错误分支会改变哪些差异；在创建预览中切换比较目标并查看范围，最后恢复正确目标，不合并错误比较。"
        },
        "task": "在自己的练习仓库提出一个只改 README 的 PR，写问题、改动和检查；核对差异与分支名称。",
        "checklist": [
          "来源和目标分支明确。",
          "PR 描述有真实验证记录。",
          "理解提出 PR 尚未合并。"
        ],
        "question": {
          "prompt": "PR 已创建后，目标分支是否一定更新？",
          "options": [
            {
              "text": "一定，创建就是合并。",
              "correct": false,
              "feedback": "提出与接受修改是两个步骤。"
            },
            {
              "text": "不一定，还要经过接收与合并。",
              "correct": true,
              "feedback": "目标分支不会仅因讨论入口创建就接纳改动。"
            },
            {
              "text": "只有换仓库名才会更新。",
              "correct": false,
              "feedback": "仓库名称不决定是否接收分支变化，应检查 PR 的合并状态。"
            }
          ]
        },
        "sources": [
          {
            "title": "GitHub Docs · pr",
            "url": "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests"
          },
          {
            "title": "GitHub Docs · flow",
            "url": "https://docs.github.com/en/get-started/using-github/github-flow"
          }
        ]
      },
      {
        "id": "handoff",
        "figureKey": "github-flow",
        "title": "Check-in / Check-out：把工作交给下一位",
        "module": "和别人改同一个项目",
        "minutes": 15,
        "conceptIds": [],
        "objective": "写出开工与收工报告，并明确它们不是 Git 内置命令。",
        "paragraphs": [
          "这里的 check-in / check-out 是团队约定的开工与收工报告名称，不是 Git 内置命令。Git 确实有 checkout 这个历史命令，但它用于切换等版本操作，与交接报告不是一回事；本课程的分支切换已用 switch 表达。",
          "开工报告写当前仓库与分支、已知状态、这次要改什么、哪些问题待确认。收工报告写实际改动、提交或 PR、验证步骤与结果、没完成的部分、下一步。它让另一位老师或 AI 助手不必靠猜测继续工作。",
          "一份好的报告必须与实际仓库一致。“已完成”后面应有可定位的内容和检查证据；失败与未测项也要写清楚。报告不会替代 commit 或 push，更不会锁定文件防止别人修改。接手时先检查现状与报告是否一致，再在约定范围内继续。"
        ],
        "example": {
          "title": "下一位老师只有这段话",
          "text": "先预测“基本完成，继续优化”能否指导接手；用下面字段给自己交接，隔十分钟不看聊天记录再找回工作位置，解释遗漏哪项最费时。",
          "code": "开工报告（团队约定，非命令）\n仓库 / 分支：\n当前状态：\n本次目标与范围：\n待确认：\n\n收工报告（团队约定，非命令）\n实际改动 / 提交或 PR：\n检查步骤与结果：\n未完成 / 未测试：\n接手后的第一步："
        },
        "task": "为练习 PR 写开工与收工两份短报告，至少包含分支、目标、真实检查、未完成项和下一步；明确标注“团队报告，非 Git 命令”。",
        "checklist": [
          "报告不是命令，也不自动同步文件。",
          "提交或 PR 能定位到实际改动。",
          "未测试和待确认事项没有被省略。"
        ],
        "question": {
          "prompt": "收工报告写“已推送”但平台没有新提交，怎么办？",
          "options": [
            {
              "text": "把报告当作事实继续合并。",
              "correct": false,
              "feedback": "报告需要与真实状态核对。"
            },
            {
              "text": "删除原仓库重新开始。",
              "correct": false,
              "feedback": "应先定位同步或目标错误。"
            },
            {
              "text": "检查远端、分支与推送结果并修正报告。",
              "correct": true,
              "feedback": "可追踪的状态比一句完成声明可靠。"
            }
          ]
        },
        "sources": [
          {
            "title": "GitHub Docs · flow",
            "url": "https://docs.github.com/en/get-started/using-github/github-flow"
          },
          {
            "title": "Git · status",
            "url": "https://git-scm.com/docs/git-status"
          }
        ]
      }
    ]
  },
  {
    "slug": "refactor-with-ai",
    "title": "与 AI 安全重构：一步改动，一步验收",
    "category": "Vibe coding",
    "summary": "用已运行的提示卡练习行为约定、函数提取、测试、差异审阅与回退。",
    "outcome": "一次保持原行为的小重构，以及基线、验收与可执行回退说明。",
    "audience": {
      "who": "页面已经能跑、但代码乱到每次交给 AI 大改都提心吊胆的开发者",
      "pain": "我只让 AI 帮我整理一下，结果它顺手把本来能用的功能也改没了。",
      "win": "一次保持原有行为的重构，外加基线、验收清单和一份真的能执行的回退步骤。"
    },
    "prerequisite": "完成 Git 与网页入门；已有可运行练习页。自动断言示例使用已安装的 Node.js，先读其官方说明。",
    "conceptIds": [],
    "lessons": [
      {
        "id": "meaning",
        "title": "重构改变内部组织，保留约定行为",
        "module": "理解安全边界",
        "minutes": 15,
        "conceptIds": [],
        "objective": "区分重构、修复缺陷与新增功能，说明保持什么不变。",
        "paragraphs": [
          "重构是调整程序内部结构，同时保持对外可观察行为不变。例如把提示按钮的重复显示逻辑整理成一个函数，用户仍按同样方式打开和收起。它不等于把页面全部换新，也不意味着顺便改变学习活动的规则。",
          "修复缺陷会有意改变错误行为，新增功能则增加新的使用方式。它们都可能有价值，但若与重构混在一次大修改里，出了问题就难判断是哪种变化造成。先写清本轮只是整理哪一部分，其他需求另开任务。",
          "AI 很擅长给出整段改写，但你负责定义不变的部分和检查方法。本课程用已能运行的提示卡作为练习：保持初始隐藏、首次展开、再次收起和键盘可用，逐步整理代码，并学习如何发现回归与恢复已知版本。"
        ],
        "example": {
          "title": "看起来一样，就一定没变吗？",
          "text": "预测重构后截图相同能否证明按钮行为相同；分别点击两次并用键盘操作，解释静态外观覆盖不到的状态。"
        },
        "task": "选择一小段提示卡代码，写“要整理什么”“必须不变什么”“本轮不加什么”，保留一个可运行副本。",
        "checklist": [
          "能区分三种改动目的。",
          "不变行为具体到操作结果。",
          "选的是已经能工作的练习页面。"
        ],
        "question": {
          "prompt": "把提示改为自动弹出并称为纯重构，准确吗？",
          "options": [
            {
              "text": "准确，只要代码更短。",
              "correct": false,
              "feedback": "触发方式已改变，是可观察行为变化。"
            },
            {
              "text": "不准确，它改变了用户使用方式。",
              "correct": true,
              "feedback": "重构需保持约定外部行为，新增规则应另说明。"
            },
            {
              "text": "取决于按钮颜色。",
              "correct": false,
              "feedback": "行为是否改变与颜色无关。"
            }
          ]
        },
        "sources": [
          {
            "title": "Martin Fowler · Refactoring",
            "url": "https://refactoring.com/"
          }
        ],
        "figureKey": "refactor"
      },
      {
        "id": "baseline",
        "figureKey": "refactor",
        "title": "先保存一个真实可运行的起点",
        "module": "理解安全边界",
        "minutes": 15,
        "conceptIds": [],
        "objective": "记录环境、当前问题与检查结果，建立可比较的基线。",
        "paragraphs": [
          "基线是修改前已经确认的状态。它包括具体版本、运行方法和观察结果，而不只是“以前应该能用”。如果起点就有一个按钮坏着，你要先记录它，否则重构后可能把旧问题误认为新回归，也可能误称全部保持正确。",
          "先查看 Git 状态与当前分支，读未提交差异，分清哪些是自己的修改。对练习项目留下清楚提交，再创建重构分支。不要为了让状态干净而删除看不懂的文件或别人的未提交工作；范围不清时先停在读取与记录。",
          "打开提示卡，完成初始、展开、收起、刷新与键盘五项检查，写实际结果。也记录浏览器与运行地址。之后所有比较以同样条件重跑，才能把变化与本次改动联系起来；一张保存的截图只是基线的一部分。"
        ],
        "example": {
          "title": "先坏的还是后来坏的？",
          "text": "预测没有修改前记录时能否判断“收起无效”从何时开始；先做五项检查，再故意在副本制造一个差异，对照说明基线的作用。"
        },
        "task": "记录当前提交、分支、启动方式和五项实际结果；保留清楚基线后再新建练习重构分支。",
        "checklist": [
          "未提交工作归属清楚。",
          "基线确实运行过。",
          "已知缺陷单独标明。"
        ],
        "question": {
          "prompt": "发现工作区有不认识的改动，应该？",
          "options": [
            {
              "text": "全部删除以便开始。",
              "correct": false,
              "feedback": "可能破坏他人或用户尚未提交的工作。"
            },
            {
              "text": "直接把它们算成本次重构。",
              "correct": false,
              "feedback": "未确认来源就纳入本次提交，会混淆已有工作与重构产生的变化。"
            },
            {
              "text": "先查看差异并确认来源，保护现有工作。",
              "correct": true,
              "feedback": "建立可靠基线需要理解当前状态。"
            }
          ]
        },
        "sources": [
          {
            "title": "Git · status",
            "url": "https://git-scm.com/docs/git-status"
          },
          {
            "title": "Git · diff",
            "url": "https://git-scm.com/docs/git-diff"
          },
          {
            "title": "Git · switch",
            "url": "https://git-scm.com/docs/git-switch"
          }
        ]
      },
      {
        "id": "behavior-contract",
        "title": "用例子写出不变行为",
        "module": "理解安全边界",
        "minutes": 15,
        "conceptIds": [],
        "objective": "把笼统要求变成输入、动作与预期结果。",
        "paragraphs": [
          "“保持所有功能”过于宽泛，难以验收。行为约定可以写成具体例子：刚打开页面时提示隐藏；按按钮后提示出现且文字改为收起；再次按下恢复初始状态。这些例子告诉 AI 和评审者什么不能被破坏。",
          "还应包含容易漏掉的边界，例如重复操作、空输入、键盘触发和刷新。对于本地反思卡，存储键的名字与数据格式也可能是对外约定：随意改名会让旧用户看不到原记录，即使新页面看起来正常。",
          "约定不必覆盖整个项目，先覆盖本轮会触及的部分与相邻路径。把已知错误另列，避免为了“保持行为”而把缺陷永久当作正确要求。如果想同时修错，应明确说明改变了哪条预期，并单独安排验证。"
        ],
        "example": {
          "title": "一张行为表比一句保证多了什么？",
          "text": "先预测“保持功能”能否发现第二次点击失败；用输入、动作、期望三列表重写要求，实际走两次点击并说明差异。"
        },
        "task": "为提示卡写五条行为约定，其中两条覆盖重复或恢复；若有存储，注明要保留的键与格式。",
        "checklist": [
          "约定能由别人执行。",
          "覆盖本轮触及的边界。",
          "已知缺陷与期望行为区分。"
        ],
        "question": {
          "prompt": "重构时换了存储键导致旧笔记消失，属于？",
          "options": [
            {
              "text": "正常，因为只是改名字。",
              "correct": false,
              "feedback": "名字影响了用户可见数据，已超出纯内部变化。"
            },
            {
              "text": "破坏了需保留的数据兼容行为。",
              "correct": true,
              "feedback": "外部约定也包括已有记录能否继续读取。"
            },
            {
              "text": "视觉风格变化。",
              "correct": false,
              "feedback": "这是数据访问行为问题。"
            }
          ]
        },
        "sources": [
          {
            "title": "Martin Fowler · Refactoring",
            "url": "https://refactoring.com/"
          },
          {
            "title": "MDN · storage",
            "url": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API"
          }
        ],
        "figureKey": "refactor"
      },
      {
        "id": "small-brief",
        "figureKey": "refactor",
        "title": "给 AI 一次只够做一步的任务",
        "module": "小步整理代码",
        "minutes": 15,
        "conceptIds": [],
        "objective": "用文件范围、不变条件与停点约束一次可检查的修改。",
        "paragraphs": [
          "一次让 AI“把项目全面优化”，常会得到大量无法快速核对的改动。更可控的任务是“只把提示卡的显示更新提取成函数，保留 HTML、按钮文字和所有行为”。范围越清楚，验收时越容易发现多做或漏做。",
          "任务说明应给现有文件、问题原因、不变条件和检查方式，要求它先读当前实现再提出最小改动。若发现需要改多个模块，先解释依赖关系，不直接顺手升级依赖或重写架构。每一步通过后再进入下一步。",
          "这里的停点是便于你读差异与运行检查，不是让 AI 反复问一句没有信息的“要继续吗”。你可以事先授权按清单推进，并要求每步附证据。若范围外问题出现，记录为后续事项，让本轮目标保持可解释。"
        ],
        "example": {
          "title": "两份任务书的差别",
          "text": "预测“全面优化”与“只提取 renderHint”各会触及多少文件；对照实际方案，解释哪些修改是完成本步必要的。"
        },
        "task": "写一份小重构说明：目标文件、内部问题、五条不变行为和验收步骤；让 AI 或自己只完成第一步。",
        "checklist": [
          "任务指向具体文件与结构。",
          "不变行为已提供。",
          "不相关依赖升级未混入。"
        ],
        "question": {
          "prompt": "AI 顺便重写整个页面，下一步应该？",
          "options": [
            {
              "text": "因为改得多就直接接受。",
              "correct": false,
              "feedback": "改动量不等于价值，也提高核对负担。"
            },
            {
              "text": "继续加更多目标。",
              "correct": false,
              "feedback": "范围进一步扩大更难判断回归。"
            },
            {
              "text": "对照约定收窄范围，先验收必要的一步。",
              "correct": true,
              "feedback": "保持任务与差异可对应，才能可靠推进。"
            }
          ]
        },
        "sources": [
          {
            "title": "Martin Fowler · Refactoring",
            "url": "https://refactoring.com/"
          },
          {
            "title": "Git · diff",
            "url": "https://git-scm.com/docs/git-diff"
          }
        ]
      },
      {
        "id": "extract-function",
        "figureKey": "refactor",
        "title": "把重复决定提取成有名字的函数",
        "module": "小步整理代码",
        "minutes": 15,
        "conceptIds": [],
        "objective": "识别共同逻辑，定义明确输入与返回值。",
        "paragraphs": [
          "函数把一组可重复的步骤放进有名字的单元。提取函数时，先看重复的究竟是同一个决定，还是只是长得相似。提示卡里“根据展开状态决定文字和可见性”是一个清楚的职责，适合单独表达。",
          "可以让 hintView 接收一个布尔值，返回标签、隐藏状态与展开属性。这样不碰页面也能比较 true 与 false 的结果，再由渲染代码应用到元素。输入与输出明确，比函数暗中修改很多无关变量更容易检查。",
          "不要为了减少行数把所有逻辑塞进一个万能函数。一个名字应说明它解决什么问题，调用处仍要能看懂。提取后先检查返回值，再走实际按钮流程；函数本身正确不代表调用位置和更新顺序都正确。"
        ],
        "example": {
          "title": "把两个状态放进同一张表",
          "text": "预测 false 与 true 应返回哪组显示值；运行下面函数两次，把结果与原按钮行为对照，解释它没有负责哪些事情。",
          "code": "function hintView(expanded) {\n  return {\n    hidden: !expanded,\n    label: expanded ? \"收起提示\" : \"打开提示\",\n    ariaExpanded: String(expanded)\n  };\n}\nconsole.log(hintView(false));\nconsole.log(hintView(true));"
        },
        "task": "提取一个只决定提示显示信息的函数，分别检查两种输入；再接回已有页面并走两次点击。",
        "checklist": [
          "函数职责可以一句话说明。",
          "输入与返回值明确。",
          "接回页面后重新验证行为。"
        ],
        "question": {
          "prompt": "一个函数需要读取十个全局变量才知道做什么，主要问题是？",
          "options": [
            {
              "text": "行为依赖隐藏，较难理解和检查。",
              "correct": true,
              "feedback": "应考虑收窄职责并显式传入必要信息。"
            },
            {
              "text": "名字不够长。",
              "correct": false,
              "feedback": "命名不能消除隐含依赖。"
            },
            {
              "text": "函数永远不适合重构。",
              "correct": false,
              "feedback": "函数是组织逻辑的一种常用方式。"
            }
          ]
        },
        "sources": [
          {
            "title": "Martin Fowler · Extract Function",
            "url": "https://refactoring.com/catalog/extractFunction.html"
          },
          {
            "title": "MDN · functions",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions"
          }
        ]
      },
      {
        "id": "data-vs-view",
        "figureKey": "refactor",
        "title": "分开内容、状态和显示职责",
        "module": "小步整理代码",
        "minutes": 15,
        "conceptIds": [],
        "objective": "识别数据、行为与呈现的边界，避免过度拆分。",
        "paragraphs": [
          "活动题目和参考是内容，当前选哪张卡是状态，把文字放到页面是显示职责。它们全部混在一段事件代码里时，改一道题也可能碰到存储或按钮行为。适度分开可以让修改范围更清楚。",
          "先在同一文件里用命名分区或小函数区分职责，再在确有需要时拆文件。模块是可以导出、导入功能的代码单元；浏览器使用模块脚本通常需要通过本地 HTTP 服务测试，而不是假设双击文件始终有效。",
          "拆分不是越细越好。三张卡的小工具不需要为了“专业”变成几十个文件。以实际变化为依据：换材料时尽量只改数据，换呈现时尽量不改记录身份。拆分之后保持数据 ID、存储格式和原使用路径，并重新检查导入是否成功。"
        ],
        "example": {
          "title": "换题目会不会碰到保存逻辑？",
          "text": "预测内容写在事件函数里与独立数据对象里，改题目各需经过哪些地方；标出职责边界，解释哪种更容易控制修改范围。"
        },
        "task": "在现有文件中标出内容、状态、显示、存储四类代码；只整理一处混杂职责，不急着增加文件数量。",
        "checklist": [
          "拆分对应真实修改需求。",
          "卡片 ID 和存储格式保持兼容。",
          "没有用文件数量衡量质量。"
        ],
        "question": {
          "prompt": "重构后文件更多，是否一定更好？",
          "options": [
            {
              "text": "一定，文件数量代表架构质量。",
              "correct": false,
              "feedback": "过度拆分也会增加查找与连接成本。"
            },
            {
              "text": "不一定，应看职责是否更清楚且行为保持。",
              "correct": true,
              "feedback": "组织价值取决于理解与维护效果。"
            },
            {
              "text": "必须全部回到一行代码。",
              "correct": false,
              "feedback": "极端压缩同样不利于理解。"
            }
          ]
        },
        "sources": [
          {
            "title": "MDN · modules",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules"
          },
          {
            "title": "MDN · functions",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions"
          }
        ]
      },
      {
        "id": "tests",
        "title": "测试是可重复的行为例子",
        "module": "验证与回退",
        "minutes": 15,
        "conceptIds": [],
        "objective": "用少量针对风险的断言捕捉回归，并知道测试覆盖的边界。",
        "paragraphs": [
          "测试把预期写成可以重复执行的检查。断言是其中的判断：实际结果应该等于哪个值，不相等就报告失败。对于 hintView 函数，可以分别检查收起和展开两种输出；这样整理内部写法后仍能快速发现行为是否变了。",
          "好测试关注使用约定，而不是复制实现的每一行。若测试也抄同一段错误逻辑，二者可能一起错。先从需求独立写预期，再运行；可以在练习副本故意改坏一个返回值，确认测试确实会失败，然后恢复。",
          "函数测试通过不代表网页全部正常，还可能有事件没绑定、焦点丢失或 CSS 覆盖隐藏的问题。自动检查与人工主路径应互补。已有项目优先运行其约定的测试，不为了一个低风险文字调整搭建庞大框架；本课用内置断言展示最小机制。"
        ],
        "example": {
          "title": "让测试真的失败一次",
          "text": "先预测把 hidden 的取反去掉会让哪条检查失败；在练习副本改坏、运行并恢复，解释失败与某条用户行为的联系。",
          "code": "import assert from \"node:assert/strict\";\n// 将上一课 hintView 函数放在这里，再执行以下检查。\nassert.deepEqual(hintView(false), {\n  hidden: true, label: \"打开提示\", ariaExpanded: \"false\"\n});\nassert.deepEqual(hintView(true), {\n  hidden: false, label: \"收起提示\", ariaExpanded: \"true\"\n});\nconsole.log(\"两种提示状态检查通过\");"
        },
        "task": "把 hintView 放入 hint-test.mjs，加入下面 Node 内置断言并运行 node hint-test.mjs；观察成功，再制造一次错误验证其检测能力，最后恢复。",
        "checklist": [
          "预期来自行为约定。",
          "至少观察过一次有意失败。",
          "函数测试与浏览器走查都做。"
        ],
        "question": {
          "prompt": "两个函数测试通过以后，还需要什么？",
          "options": [
            {
              "text": "删除浏览器检查。",
              "correct": false,
              "feedback": "函数测试未覆盖 DOM、事件和焦点等连接。"
            },
            {
              "text": "假定所有页面都符合要求。",
              "correct": false,
              "feedback": "测试结论只限已覆盖情境。"
            },
            {
              "text": "在实际页面验证连接后的主路径。",
              "correct": true,
              "feedback": "集成与用户操作可能暴露另一些问题。"
            }
          ]
        },
        "sources": [
          {
            "title": "Node.js · Assertion testing",
            "url": "https://nodejs.org/api/assert.html"
          },
          {
            "title": "Node.js · Test runner",
            "url": "https://nodejs.org/api/test.html"
          }
        ],
        "figureKey": "refactor"
      },
      {
        "id": "review-change",
        "figureKey": "refactor",
        "title": "读差异，找出没有被测试照亮的地方",
        "module": "验证与回退",
        "minutes": 15,
        "conceptIds": [],
        "objective": "结合改动范围与行为检查，识别意外删除和语义变化。",
        "paragraphs": [
          "差异审阅让你看到这一步真正改变了什么。先按文件范围检查，再读关键增删：有没有丢掉标签、错误处理、存储版本或键盘语义。AI 的总结可作为导航，但要以实际文件和运行结果为依据。",
          "比如重构后删除 aria-expanded，鼠标点击仍可能正常，简单函数测试也可能通过，但辅助技术获得的状态信息变少了。又如只测试展开，忘记收起路径，会漏掉按钮文字与内容不同步。审阅应围绕可能受影响的使用方式补检查。",
          "问题记录写位置、影响与重现方法，区分必须修的行为破坏和个人风格偏好。修复后重跑相关检查，再决定是否接受本步。若一次差异太大读不清，就把改动拆小，而不是只因为页面还亮着便相信全部保持。"
        ],
        "example": {
          "title": "一行删除为何重要？",
          "text": "预测删除 aria-expanded 会不会影响鼠标截图；比较鼠标行为和元素语义信息，解释“看起来一样”遗漏了哪个使用条件。"
        },
        "task": "阅读本步全部差异，找一项测试可能未覆盖的行为，补一次定向检查；写出结果与是否接受的理由。",
        "checklist": [
          "审阅范围包括语义与失败处理。",
          "问题反馈有具体影响。",
          "没有仅凭 AI 总结接受。"
        ],
        "question": {
          "prompt": "鼠标操作正常但键盘失效，属于什么？",
          "options": [
            {
              "text": "可忽略的个人偏好。",
              "correct": false,
              "feedback": "原有操作方式被破坏，属于行为回归。"
            },
            {
              "text": "需要修复的约定行为变化。",
              "correct": true,
              "feedback": "行为不变包括已支持的输入方式。"
            },
            {
              "text": "证明重构效果更好。",
              "correct": false,
              "feedback": "少支持一种使用方式不是内部整理成果。"
            }
          ]
        },
        "sources": [
          {
            "title": "Git · diff",
            "url": "https://git-scm.com/docs/git-diff"
          },
          {
            "title": "W3C WAI · Easy Checks",
            "url": "https://www.w3.org/WAI/test-evaluate/easy-checks/"
          }
        ]
      },
      {
        "id": "rollback",
        "figureKey": "refactor",
        "title": "无法确认时，退回已知可用版本",
        "module": "验证与回退",
        "minutes": 15,
        "conceptIds": [],
        "objective": "选择与提交状态相符的回退方式，并验证恢复结果。",
        "paragraphs": [
          "回退计划让重构可以停在已知状态，不必为了维护已经花掉的时间继续叠加补丁。开始前就记录基线提交与本步边界，失败时先保存问题描述和必要差异，再决定撤销哪一层；不要盲目丢弃整个工作区。",
          "尚未提交的改动与已共享提交需要不同处理。对于已提交且共享的一次普通重构，可以用 revert 创建反向提交，保留发生与撤回的记录。若只是暂存选择错误，则调整暂存区，不必同时丢掉文件内容。",
          "回退也需要检查：页面能否重新打开、旧记录是否还能读、问题是否真的消失。若基线本来就有缺陷，恢复它不会神奇修复缺陷。把失败原因写入下一次更小的任务，让回退成为学习到的边界，而不是隐藏错误。"
        ],
        "example": {
          "title": "退回文件后就结束了吗？",
          "text": "预测反向提交能否保证所有运行环境都恢复；在练习仓库回退一条自己的普通提交，重走基线路径并解释恢复范围。"
        },
        "task": "写一份回退步骤，标明目标提交、需保护的工作和恢复后检查；在练习仓库演练一次并记录结果。",
        "checklist": [
          "回退目标清楚且不混入他人工作。",
          "选择了适合当前提交状态的方式。",
          "恢复后实际运行并检查数据。"
        ],
        "question": {
          "prompt": "回退成功的最终依据是什么？",
          "options": [
            {
              "text": "命令没有红字就够了。",
              "correct": false,
              "feedback": "命令执行与用户行为恢复仍需核对。"
            },
            {
              "text": "删掉失败记录。",
              "correct": false,
              "feedback": "这会丢失后续定位依据。"
            },
            {
              "text": "目标版本恢复且相关行为重新通过检查。",
              "correct": true,
              "feedback": "版本和运行表现都与回退目标对应。"
            }
          ]
        },
        "sources": [
          {
            "title": "Git · restore",
            "url": "https://git-scm.com/docs/git-restore"
          },
          {
            "title": "Git · revert",
            "url": "https://git-scm.com/docs/git-revert"
          }
        ]
      },
      {
        "id": "refactor-report",
        "figureKey": "refactor",
        "title": "交付能继续维护的重构结果",
        "module": "验证与回退",
        "minutes": 15,
        "conceptIds": [],
        "objective": "说明内部改善、不变行为、测试证据和剩余风险。",
        "paragraphs": [
          "重构交付要让后来的人知道内部为何更容易理解，同时知道外部哪些行为保持了。说明“把重复的提示显示判断收进 hintView，两个调用处共用”比“全面提升代码质量”更具体，也方便核对。",
          "列出基线与最终提交、修改文件、执行过的测试和人工路径结果。未测试的浏览器、仍存在的旧缺陷与未来想做的功能分开写。不要用“测试全绿”覆盖未配置的范围，更不要把重构顺便包装成学习效果提升。",
          "最后按照 README 从头启动，完成展开、收起、刷新和键盘检查，再读一次差异。确认没有混入临时日志或假数据后留下提交。下一轮只选择一个有清楚理由的整理目标，把小步验收与可回退的习惯延续下去。"
        ],
        "example": {
          "title": "评审者能复现你的结论吗？",
          "text": "预测仅写“优化完成”能否帮助同事验收；按你的交付说明重跑测试和按钮流程，解释哪些证据支持了“保持行为”。"
        },
        "task": "交付一份重构说明：问题、内部变化、保持的行为、检查结果、回退点和未覆盖范围；从说明重新操作一遍。",
        "checklist": [
          "变化理由具体可核对。",
          "证据写明执行方式与结果。",
          "未覆盖项没有混成通过。"
        ],
        "question": {
          "prompt": "最有说服力的重构总结是？",
          "options": [
            {
              "text": "说明具体结构变化并附保持行为的检查记录。",
              "correct": true,
              "feedback": "改善与证据相连，便于接手者审阅。"
            },
            {
              "text": "代码更像专业工程师写的。",
              "correct": false,
              "feedback": "主观印象无法说明行为保持。"
            },
            {
              "text": "用了更多框架所以不会出错。",
              "correct": false,
              "feedback": "工具数量不能保证正确性。"
            }
          ]
        },
        "sources": [
          {
            "title": "Martin Fowler · Refactoring",
            "url": "https://refactoring.com/"
          },
          {
            "title": "Git · diff",
            "url": "https://git-scm.com/docs/git-diff"
          }
        ]
      }
    ]
  }
];

export function getCourse(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}
