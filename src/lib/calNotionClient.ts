import { Client, isFullPage } from '@notionhq/client';
import type { CreatePageParameters, PageObjectResponse } from '@notionhq/client';
import { clipRichText, NOTION_PROP, type ExistingLead, type LeadWrite } from './calNotionMapper';

type NotionProperties = NonNullable<CreatePageParameters['properties']>;

const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NotionLeadsStore = {
  findByBookingId: (uid: string) => Promise<ExistingLead | null>;
  create: (write: LeadWrite) => Promise<{ id: string }>;
  update: (pageId: string, write: LeadWrite) => Promise<void>;
};

function textItem(content: string) {
  return { type: 'text' as const, text: { content: clipRichText(content) } };
}

export function toNotionProperties(write: LeadWrite): NotionProperties {
  const properties: NotionProperties = {};

  if (write.nombre !== undefined) {
    properties[NOTION_PROP.nombre] = { title: [textItem(write.nombre)] };
  }
  if (write.email !== undefined && SIMPLE_EMAIL.test(write.email)) {
    properties[NOTION_PROP.email] = { email: write.email };
  }
  if (write.canal !== undefined) {
    properties[NOTION_PROP.canal] = { select: { name: write.canal } };
  }
  if (write.tipo !== undefined) {
    properties[NOTION_PROP.tipo] = { select: { name: write.tipo } };
  }
  if (write.estado !== undefined) {
    properties[NOTION_PROP.estado] = { select: { name: write.estado } };
  }
  if (write.asunto !== undefined) {
    properties[NOTION_PROP.asunto] = { rich_text: [textItem(write.asunto)] };
  }
  if (write.mensaje !== undefined) {
    properties[NOTION_PROP.mensaje] = { rich_text: [textItem(write.mensaje)] };
  }
  if (write.calBookingId !== undefined) {
    properties[NOTION_PROP.calBookingId] = { rich_text: [textItem(write.calBookingId)] };
  }
  if (write.stripePaymentIntent !== undefined) {
    properties[NOTION_PROP.stripePaymentIntent] = {
      rich_text: [textItem(write.stripePaymentIntent)]
    };
  }
  if (write.fuente !== undefined) {
    properties[NOTION_PROP.fuente] = { rich_text: [textItem(write.fuente)] };
  }
  if (write.fecha !== undefined) {
    properties[NOTION_PROP.fecha] = { date: { start: write.fecha } };
  }
  if (write.notas !== undefined) {
    properties[NOTION_PROP.notas] = { rich_text: [textItem(write.notas)] };
  }
  if (write.vertical !== undefined) {
    properties[NOTION_PROP.vertical] = { rich_text: [textItem(write.vertical)] };
  }
  if (write.budget !== undefined) {
    properties[NOTION_PROP.budget] = { rich_text: [textItem(write.budget)] };
  }
  if (write.referralCode !== undefined) {
    properties[NOTION_PROP.referralCode] = { rich_text: [textItem(write.referralCode)] };
  }
  if (write.consentMarketing !== undefined) {
    properties[NOTION_PROP.consentMarketing] = { checkbox: write.consentMarketing };
  }

  return properties;
}

function richTextPlain(page: PageObjectResponse, name: string): string | undefined {
  const prop = page.properties[name];
  if (!prop || prop.type !== 'rich_text') return undefined;
  const text = prop.rich_text.map((item) => item.plain_text).join('');
  return text || undefined;
}

function selectName(page: PageObjectResponse, name: string): string | undefined {
  const prop = page.properties[name];
  if (!prop || prop.type !== 'select') return undefined;
  return prop.select?.name || undefined;
}

export function existingLeadFromPage(page: PageObjectResponse): ExistingLead {
  return {
    id: page.id,
    notes: richTextPlain(page, NOTION_PROP.notas),
    estado: selectName(page, NOTION_PROP.estado)
  };
}

/**
 * Adaptador Notion API 2025-09-03 (@notionhq/client v5).
 * `dataSourceId` debe ser el id de la data source, no el de la página contenedora.
 */
export function createNotionLeadsStore(token: string, dataSourceId: string): NotionLeadsStore {
  const notion = new Client({ auth: token, notionVersion: '2025-09-03' });

  return {
    async findByBookingId(uid) {
      const res = await notion.dataSources.query({
        data_source_id: dataSourceId,
        page_size: 1,
        filter: {
          property: NOTION_PROP.calBookingId,
          rich_text: { equals: uid }
        }
      });
      const first = res.results[0];
      if (!first || first.object !== 'page') return null;
      if (!isFullPage(first)) return { id: first.id };
      return existingLeadFromPage(first);
    },

    async create(write) {
      const page = await notion.pages.create({
        parent: { type: 'data_source_id', data_source_id: dataSourceId },
        properties: toNotionProperties(write)
      });
      return { id: page.id };
    },

    async update(pageId, write) {
      await notion.pages.update({
        page_id: pageId,
        properties: toNotionProperties(write)
      });
    }
  };
}
