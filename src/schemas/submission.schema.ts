import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

// Pomoćna šema za svaki pojedinačni odgovor
@Schema({ _id: false }) 
export class Answer {
  @Prop({ required: true })
  questionKey!: string;

  @Prop({ required: true })
  questionText!: string; 

  @Prop({ required: true })
  category!: string; 

  @Prop({ required: true, default:1 })
  questionVersion!: number;

  // Mixed tip zbog razlicitih pitanja, nesto dolazi kao string/int/itd.
  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  value!: any; 
}
export const OdgovorSchema = SchemaFactory.createForClass(Answer);

export type SubmissionDocument = Submission & Document;

// Glavna šema prijave
@Schema({ timestamps: true })
export class Submission {
  //Napomena: state se sada zapravo mapira iz pitanja za drzavu
  @Prop({ required: true, index: true }) 
  state!: string; 

  @Prop({ required: true, index: true })
  institution!: string; // Mapira se iz pitanja "Please select your home university"

  @Prop({ required: true, index: true })
  questionnaireVersion!: number;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  mobilityDone!: boolean; // Backend ovo da validira proverom odgovora na pitanje o razmeni

  @Prop({required: true})
  isRealAttempt!: boolean;

  @Prop({required: true, unique: true, index: true})
  benchmarkCode!: string;

  // Odgovori na jedan upitnik kao lista-
  @Prop({ type: [OdgovorSchema], required: true })
  answers!: Answer[];
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);