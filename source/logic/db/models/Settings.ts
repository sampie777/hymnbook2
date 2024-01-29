export interface SettingProps {
  key: string;
  value: string;
}

export class Setting {
  key: string = "";
  value: string = "";

  constructor({ key, value }: SettingProps) {
    this.key = key;
    this.value = value;
  }
}

export class SettingPatch {
  id: number;
  createdAt: Date;

  constructor(id: number, createdAt: Date = new Date()) {
    this.id = id;
    this.createdAt = createdAt;
  }
}