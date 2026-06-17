import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
} from 'sequelize-typescript';

import EventPerk from './event-perk.model';
import EventOrganiser from './event-organiser.model';
import EventFaq from './event-faq.model';
import { EventState } from './event-state';

@Table({
  tableName: 'events',
  timestamps: true,
})
export default class Event extends Model {

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: EventState.DRAFT,
  })
  declare state: EventState;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare featured: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  declare tag?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare accentColour: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare eventDescription: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare ticketsLink?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare ticketSaleEndDate?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare eventDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare icon?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare fullLogo?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare fairy?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare logo?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare background?: string;

  // relations
  @HasMany(() => EventPerk)
  declare perks: EventPerk[];

  @HasMany(() => EventOrganiser)
  declare organisers: EventOrganiser[];

  @HasMany(() => EventFaq)
  declare faqs: EventFaq[];
}
