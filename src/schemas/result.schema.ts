import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ResultDocument = Result & Document;

@Schema({ timestamps: true })
export class Result {
  @Prop({ type: Types.ObjectId, ref: 'Submission' })
  submissionId!: string;

  @Prop({ required: true })
  isRealAttempt!: boolean;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  benchmarkCode!: string;

  @Prop({ required: true })
  ecoScore!: number;

  @Prop({ required: true, type: Map, of: Number })
  categoryScores!: Record<string, number>;

  //ovo su rezultati za mobilnost
  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  mobility!: any;

  @Prop({ required: true })
  badge!: string;

  @Prop({ required: true })
  completionTimeSeconds!: number;

  @Prop({ required: true })
  state!: string;

  @Prop({ required: true })
  institution!: string;
}

export const ResultSchema = SchemaFactory.createForClass(Result);
