import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true, unique: true })
  key!: string; // Pseudo kljuc za pitanja - tipa awareness_1

  @Prop({ required: true })
  text!: string; 

  @Prop({ required: true })
  category!: string; // Npr. Awareness i slicno

  @Prop({ required: true, enum: ['LIKERT', 'SINGLE_CHOICE', 'NUMBER', 'TEXT','LIKERT-MATRIX','RUBRIC'] })
  type!: string; 

  @Prop({ type: mongoose.Schema.Types.Mixed, default: [] })
  options!: any; 

  @Prop({ default: 1 })
  version!: number; 

  @Prop({ default: true })
  active!: boolean;

  @Prop({ default: false })
  optional!: boolean; // True za pitanja iz poslednje 3 rubrike
}

export const QuestionSchema = SchemaFactory.createForClass(Question);