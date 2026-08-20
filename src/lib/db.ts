import Dexie, { type Table } from "dexie";

export interface Student {
  id?: number;
  studentId: string;
  name: string;
  father: string;
  mother: string;
  phone: string;
  className: string;
  roll: number;
  address: string;
  admissionDate: string;
}

class MadrasaDB extends Dexie {
  students!: Table<Student, number>;

  constructor() {
    super("MadrasaDB");

    this.version(1).stores({
      students: "++id, studentId, name, className, roll",
    });
  }
}

export const db = new MadrasaDB();