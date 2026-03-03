import { ApiError } from '../../core/api-error.js';
import { auditService } from '../shared/audit.service.js';
import { notesRepository } from './notes.repository.js';

type CreateNoteInput = {
  title: string;
  content: string;
  color?: string;
  label?: string;
  pinned: boolean;
};

type UpdateNoteInput = Partial<CreateNoteInput>;

export const notesService = {
  getAll: async (userId: string) => {
    return notesRepository.findManyByUser(userId);
  },
  create: async (userId: string, input: CreateNoteInput) => {
    const created = await notesRepository.create({
      userId,
      title: input.title,
      content: input.content,
      color: input.color,
      label: input.label,
      pinned: input.pinned,
    });

    await auditService.logActivity({
      actorId: userId,
      action: 'note_created',
      entityType: 'note',
      noteId: created.id,
      metadata: { title: created.title },
    });

    return created;
  },
  getById: async (userId: string, id: string) => {
    const note = await notesRepository.findByIdForUser(id, userId);
    if (!note) {
      throw new ApiError(404, 'Note not found');
    }

    return note;
  },
  update: async (userId: string, id: string, input: UpdateNoteInput) => {
    const existing = await notesRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new ApiError(404, 'Note not found');
    }

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.content !== undefined) data.content = input.content;
    if (input.color !== undefined) data.color = input.color;
    if (input.label !== undefined) data.label = input.label;
    if (input.pinned !== undefined) data.pinned = input.pinned;

    const updated = await notesRepository.update(id, data);

    await auditService.logActivity({
      actorId: userId,
      action: input.pinned ? 'note_pinned' : 'note_updated',
      entityType: 'note',
      noteId: id,
      metadata: { title: updated.title },
    });

    return updated;
  },
  remove: async (userId: string, id: string) => {
    const existing = await notesRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new ApiError(404, 'Note not found');
    }

    await notesRepository.remove(id);
    await auditService.logActivity({
      actorId: userId,
      action: 'note_deleted',
      entityType: 'note',
      metadata: { noteId: id, title: existing.title },
    });

    return { message: 'Note deleted' };
  },
};
