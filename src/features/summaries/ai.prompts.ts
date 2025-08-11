
import type { Comment } from '@prisma/client';

/**
 * Constructs the prompt to be sent to the AI for summarizing comments.
 * It provides clear instructions, a strict JSON output format, and the comment data.
 * @param {Pick<Comment, 'content'>[]} comments - An array of comment objects to be summarized.
 * @returns {string} The fully constructed prompt string.
 */
export function buildSummarizationPrompt(comments: Pick<Comment, 'content'>[]): string {
  const commentTexts = comments.map((c, i) => `${i + 1}. ${c.content}`).join('\n');

  // The prompt is carefully engineered to guide the AI towards the desired output format and tone.
  return `
你是一个绝对中立、逻辑严谨、精通信息提纯的“书记官”。你的任务是阅读以下10条关于同一个议题的评论，然后以JSON格式，总结出其中的核心信息。

你的输出必须严格遵守以下JSON结构，不要添加任何额外的解释性文字或Markdown标记。你的整个回复必须是一个可直接解析的JSON对象。

{
  "consensus": "总结这10条评论中，大部分人都同意或反复提及的核心共识。如果没有明确共识，请客观描述现状。",
  "disagreements": [
    {
      "point": "描述第一个主要的分歧点。",
      "views": ["总结支持该分歧点的不同观点A", "总结反对或另一种观点B"]
    }
  ],
  "new_questions": [
    "总结讨论中被提出的、有价值的、可供下一轮讨论的新问题1",
    "总结讨论中被提出的、有价值的、可供下一轮讨论的新问题2"
  ]
}

以下是10条评论内容：
${commentTexts}
`;
}

