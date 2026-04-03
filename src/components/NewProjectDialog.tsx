import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Textarea,
  Label,
  Field,
  Text,
  tokens,
} from '@fluentui/react-components';
import { useAppContext } from '../context/AppContext';
import { Project, WorkflowStage } from '../types';

interface NewProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export function NewProjectDialog({ open, onClose, onCreated }: NewProjectDialogProps) {
  const { dispatch } = useAppContext();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [codeError, setCodeError] = useState('');

  // Reset form whenever the dialog opens
  useEffect(() => {
    if (open) {
      setName('');
      setCode('');
      setDescription('');
      setNameError('');
      setCodeError('');
    }
  }, [open]);

  function handleClose() {
    onClose();
  }

  function handleSubmit() {
    let valid = true;

    if (!name.trim()) {
      setNameError('Project name is required.');
      valid = false;
    } else {
      setNameError('');
    }

    if (!code.trim()) {
      setCodeError('Project code is required.');
      valid = false;
    } else {
      setCodeError('');
    }

    if (!valid) return;

    const newProject: Project = {
      id: `PRJ-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      stage: WorkflowStage.Draft,
      workstreams: [],
    };

    dispatch({ type: 'CREATE_PROJECT', project: newProject });
    onCreated(newProject.id);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(_e, data) => { if (!data.open) handleClose(); }}>
      <DialogSurface>
        <DialogTitle>New Project</DialogTitle>
        <DialogBody>
          <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>

              <Field
                label={<Label required>Project Name</Label>}
                validationState={nameError ? 'error' : 'none'}
                validationMessage={
                  nameError
                    ? <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>{nameError}</Text>
                    : undefined
                }
              >
                <Input
                  value={name}
                  onChange={(_e, data) => setName(data.value)}
                  placeholder="e.g. Smart Factory Phase 2"
                />
              </Field>

              <Field
                label={<Label required>Project Code</Label>}
                validationState={codeError ? 'error' : 'none'}
                validationMessage={
                  codeError
                    ? <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>{codeError}</Text>
                    : undefined
                }
              >
                <Input
                  value={code}
                  onChange={(_e, data) => setCode(data.value.toUpperCase())}
                  placeholder="PRJ-001"
                />
              </Field>

              <Field label={<Label>Description</Label>}>
                <Textarea
                  value={description}
                  onChange={(_e, data) => setDescription(data.value)}
                  placeholder="Optional project description"
                  resize="vertical"
                />
              </Field>

            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="outline" onClick={handleClose}>Cancel</Button>
            <Button appearance="primary" onClick={handleSubmit}>Create Project</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
