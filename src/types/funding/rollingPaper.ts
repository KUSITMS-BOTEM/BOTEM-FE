export type RollingPaperMessage = {
  messageId: number;
  participantName: string;
  participantProfileImageUrl: string | null;
  content: string | null;
  paperTemplateCode: string;
  decorationCode: string | null;
  photoUrl: string | null;
  voiceUrl: string | null;
  voiceDurationSeconds: number | null;
  voiceTranscript: string | null;
};

export type RollingPaperResponse = {
  fundingId: number;
  celebrantName: string;
  messageCount: number;
  messages: RollingPaperMessage[];
};
