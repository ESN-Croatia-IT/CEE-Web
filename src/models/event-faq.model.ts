import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';

import Event from './event.model';

@Table({
  tableName: 'event_faq',
  timestamps: true,
})
export default class EventFaq extends Model {

  @ForeignKey(() => Event)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare eventId: number;

  @BelongsTo(() => Event)
  declare event: Event;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare question: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare answer: string;
}
