import type { UpdateKnowledgeDocumentInput } from '../validation/update-knowledge-document.schema';

export class UpdateKnowledgeDocumentCommand {
  constructor(
    readonly title: string,
    readonly content: string,
    readonly triggerKeywords: string | null,
  ) {}

  static fromInput(input: UpdateKnowledgeDocumentInput): UpdateKnowledgeDocumentCommand {
    return new UpdateKnowledgeDocumentCommand(input.title, input.content, input.triggerKeywords ?? null);
  }
}
