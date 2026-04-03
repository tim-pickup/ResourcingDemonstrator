import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Dropdown,
  Option,
  Textarea,
  Field,
  Label,
  Text,
  tokens,
} from '@fluentui/react-components';
import { useAppContext } from '../context/AppContext';
import {
  ProficiencyLevel,
  Quarter,
  QUARTER_ORDER,
  DemandLine,
} from '../types';
import { THEMES } from '../data/taxonomy';

interface AddDemandLineDialogProps {
  projectId: string;
  workstreamId: string;
  workstreamStartQ: Quarter;
  workstreamEndQ: Quarter;
  open: boolean;
  onClose: () => void;
}

const PROFICIENCY_LEVELS = Object.values(ProficiencyLevel);
const FTE_OPTIONS = ['0.25', '0.5', '0.75', '1.0'];

// Flatten all skills from all themes into a single list
const ALL_SKILLS = THEMES.flatMap((theme) =>
  theme.skills.map((skill) => ({
    id: skill.id,
    label: `${skill.id} — ${skill.name}`,
  }))
);

export function AddDemandLineDialog({
  projectId,
  workstreamId,
  workstreamStartQ,
  workstreamEndQ,
  open,
  onClose,
}: AddDemandLineDialogProps) {
  const { dispatch } = useAppContext();

  const [skillId, setSkillId] = useState('');
  const [requiredLevel, setRequiredLevel] = useState<ProficiencyLevel | ''>('');
  const [fte, setFte] = useState('');
  const [startQ, setStartQ] = useState<Quarter | ''>('');
  const [endQ, setEndQ] = useState<Quarter | ''>('');
  const [justification, setJustification] = useState('');

  const [skillError, setSkillError] = useState('');
  const [levelError, setLevelError] = useState('');
  const [fteError, setFteError] = useState('');
  const [startQError, setStartQError] = useState('');
  const [endQError, setEndQError] = useState('');
  const [justificationError, setJustificationError] = useState('');

  useEffect(() => {
    if (open) {
      setSkillId('');
      setRequiredLevel('');
      setFte('');
      setStartQ('');
      setEndQ('');
      setJustification('');
      setSkillError('');
      setLevelError('');
      setFteError('');
      setStartQError('');
      setEndQError('');
      setJustificationError('');
    }
  }, [open]);

  // Quarters within the workstream window
  const workstreamQuarters = useMemo((): Quarter[] => {
    const startIdx = QUARTER_ORDER.indexOf(workstreamStartQ);
    const endIdx = QUARTER_ORDER.indexOf(workstreamEndQ);
    return QUARTER_ORDER.filter((_, i) => i >= startIdx && i <= endIdx);
  }, [workstreamStartQ, workstreamEndQ]);

  // End quarter options: from selected startQ to workstreamEndQ
  const endQuarterOptions = useMemo((): Quarter[] => {
    if (!startQ) return workstreamQuarters;
    const startIdx = QUARTER_ORDER.indexOf(startQ as Quarter);
    const endIdx = QUARTER_ORDER.indexOf(workstreamEndQ);
    return QUARTER_ORDER.filter((_, i) => i >= startIdx && i <= endIdx);
  }, [startQ, workstreamQuarters, workstreamEndQ]);

  function handleStartQChange(value: Quarter) {
    setStartQ(value);
    // Reset endQ if it's before the new startQ
    if (endQ && QUARTER_ORDER.indexOf(endQ as Quarter) < QUARTER_ORDER.indexOf(value)) {
      setEndQ('');
    }
  }

  function handleSubmit() {
    let valid = true;

    if (!skillId) {
      setSkillError('Skill is required.');
      valid = false;
    } else {
      setSkillError('');
    }

    if (!requiredLevel) {
      setLevelError('Required level is required.');
      valid = false;
    } else {
      setLevelError('');
    }

    if (!fte) {
      setFteError('FTE is required.');
      valid = false;
    } else {
      setFteError('');
    }

    if (!startQ) {
      setStartQError('Start quarter is required.');
      valid = false;
    } else {
      setStartQError('');
    }

    if (!endQ) {
      setEndQError('End quarter is required.');
      valid = false;
    } else {
      setEndQError('');
    }

    if (!justification.trim() || justification.trim().length < 10) {
      setJustificationError('Justification is required (minimum 10 characters).');
      valid = false;
    } else {
      setJustificationError('');
    }

    if (!valid) return;

    const newDemandLine: DemandLine = {
      id: `DL-${Date.now()}`,
      skillId,
      requiredLevel: requiredLevel as ProficiencyLevel,
      fte: parseFloat(fte),
      startQuarter: startQ as Quarter,
      endQuarter: endQ as Quarter,
      justification: justification.trim(),
    };

    dispatch({ type: 'ADD_DEMAND_LINE', projectId, workstreamId, demandLine: newDemandLine });
    onClose();
  }

  // Display label for selected skill
  const selectedSkillLabel = skillId
    ? ALL_SKILLS.find((s) => s.id === skillId)?.label ?? skillId
    : '';

  return (
    <Dialog open={open} onOpenChange={(_e, data) => { if (!data.open) onClose(); }}>
      <DialogSurface>
        <DialogTitle>Add Demand Line</DialogTitle>
        <DialogBody>
          <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Skill */}
              <Field
                label={<Label required>Skill</Label>}
                validationState={skillError ? 'error' : 'none'}
                validationMessage={
                  skillError
                    ? <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>{skillError}</Text>
                    : undefined
                }
              >
                <Dropdown
                  placeholder="Select skill"
                  value={selectedSkillLabel}
                  onOptionSelect={(_e, data) => setSkillId(data.optionValue as string)}
                >
                  {ALL_SKILLS.map((skill) => (
                    <Option key={skill.id} value={skill.id} text={skill.label}>
                      {skill.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>

              {/* Required level */}
              <Field
                label={<Label required>Required Level</Label>}
                validationState={levelError ? 'error' : 'none'}
                validationMessage={
                  levelError
                    ? <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>{levelError}</Text>
                    : undefined
                }
              >
                <Dropdown
                  placeholder="Select proficiency level"
                  value={requiredLevel}
                  onOptionSelect={(_e, data) => setRequiredLevel(data.optionValue as ProficiencyLevel)}
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <Option key={level} value={level}>{level}</Option>
                  ))}
                </Dropdown>
              </Field>

              {/* FTE */}
              <Field
                label={<Label required>FTE</Label>}
                validationState={fteError ? 'error' : 'none'}
                validationMessage={
                  fteError
                    ? <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>{fteError}</Text>
                    : undefined
                }
              >
                <Dropdown
                  placeholder="Select FTE"
                  value={fte}
                  onOptionSelect={(_e, data) => setFte(data.optionValue as string)}
                >
                  {FTE_OPTIONS.map((f) => (
                    <Option key={f} value={f}>{f}</Option>
                  ))}
                </Dropdown>
              </Field>

              {/* Start quarter */}
              <Field
                label={<Label required>Start Quarter</Label>}
                validationState={startQError ? 'error' : 'none'}
                validationMessage={
                  startQError
                    ? <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>{startQError}</Text>
                    : undefined
                }
              >
                <Dropdown
                  placeholder="Select start quarter"
                  value={startQ}
                  onOptionSelect={(_e, data) => handleStartQChange(data.optionValue as Quarter)}
                >
                  {workstreamQuarters.map((q) => (
                    <Option key={q} value={q}>{q}</Option>
                  ))}
                </Dropdown>
              </Field>

              {/* End quarter */}
              <Field
                label={<Label required>End Quarter</Label>}
                validationState={endQError ? 'error' : 'none'}
                validationMessage={
                  endQError
                    ? <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>{endQError}</Text>
                    : undefined
                }
              >
                <Dropdown
                  placeholder="Select end quarter"
                  value={endQ}
                  onOptionSelect={(_e, data) => setEndQ(data.optionValue as Quarter)}
                >
                  {endQuarterOptions.map((q) => (
                    <Option key={q} value={q}>{q}</Option>
                  ))}
                </Dropdown>
              </Field>

              {/* Justification */}
              <Field
                label={<Label required>Justification</Label>}
                validationState={justificationError ? 'error' : 'none'}
                validationMessage={
                  justificationError
                    ? <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>{justificationError}</Text>
                    : undefined
                }
              >
                <Textarea
                  value={justification}
                  onChange={(_e, data) => setJustification(data.value)}
                  placeholder="Describe why this resource is needed (min. 10 characters)"
                  resize="vertical"
                />
              </Field>

            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="outline" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" onClick={handleSubmit}>Add Demand Line</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
