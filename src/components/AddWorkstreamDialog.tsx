import React, { useState, useEffect } from 'react';
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
  Field,
  Label,
  Text,
  tokens,
} from '@fluentui/react-components';
import { useAppContext } from '../context/AppContext';
import {
  WorkstreamName,
  FundingSource,
  Quarter,
  QUARTER_ORDER,
  Workstream,
} from '../types';

interface AddWorkstreamDialogProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

const WORKSTREAM_NAMES = Object.values(WorkstreamName);

export function AddWorkstreamDialog({ projectId, open, onClose }: AddWorkstreamDialogProps) {
  const { dispatch } = useAppContext();

  const [wsName, setWsName] = useState<WorkstreamName | ''>('');
  const [funding, setFunding] = useState<FundingSource>(FundingSource.Sector);
  const [startQ, setStartQ] = useState<Quarter | ''>('');
  const [endQ, setEndQ] = useState<Quarter | ''>('');

  const [wsNameError, setWsNameError] = useState('');
  const [startQError, setStartQError] = useState('');
  const [endQError, setEndQError] = useState('');

  useEffect(() => {
    if (open) {
      setWsName('');
      setFunding(FundingSource.Sector);
      setStartQ('');
      setEndQ('');
      setWsNameError('');
      setStartQError('');
      setEndQError('');
    }
  }, [open]);

  // Quarters available for end: must be >= startQ
  const endQuarterOptions: Quarter[] = startQ
    ? QUARTER_ORDER.filter((q) => QUARTER_ORDER.indexOf(q) >= QUARTER_ORDER.indexOf(startQ as Quarter))
    : QUARTER_ORDER;

  function handleStartQChange(value: Quarter) {
    setStartQ(value);
    // Reset endQ if it's now before the new startQ
    if (endQ && QUARTER_ORDER.indexOf(endQ as Quarter) < QUARTER_ORDER.indexOf(value)) {
      setEndQ('');
    }
  }

  function handleSubmit() {
    let valid = true;

    if (!wsName) {
      setWsNameError('Workstream type is required.');
      valid = false;
    } else {
      setWsNameError('');
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

    if (!valid) return;

    const newWorkstream: Workstream = {
      id: `WS-${Date.now()}`,
      name: wsName as WorkstreamName,
      fundingSource: funding,
      startQuarter: startQ as Quarter,
      endQuarter: endQ as Quarter,
      demandLines: [],
    };

    dispatch({ type: 'ADD_WORKSTREAM', projectId, workstream: newWorkstream });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(_e, data) => { if (!data.open) onClose(); }}>
      <DialogSurface>
        <DialogTitle>Add Workstream</DialogTitle>
        <DialogBody>
          <DialogContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Workstream type */}
              <Field
                label={<Label required>Workstream Type</Label>}
                validationState={wsNameError ? 'error' : 'none'}
                validationMessage={
                  wsNameError
                    ? <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>{wsNameError}</Text>
                    : undefined
                }
              >
                <Dropdown
                  placeholder="Select workstream type"
                  value={wsName}
                  onOptionSelect={(_e, data) => setWsName(data.optionValue as WorkstreamName)}
                >
                  {WORKSTREAM_NAMES.map((n) => (
                    <Option key={n} value={n}>{n}</Option>
                  ))}
                </Dropdown>
              </Field>

              {/* Funding source toggle */}
              <Field label={<Label required>Funding Source</Label>}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    appearance={funding === FundingSource.Sector ? 'primary' : 'outline'}
                    onClick={() => setFunding(FundingSource.Sector)}
                  >
                    Sector
                  </Button>
                  <Button
                    appearance={funding === FundingSource.Project ? 'primary' : 'outline'}
                    onClick={() => setFunding(FundingSource.Project)}
                  >
                    Project
                  </Button>
                </div>
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
                  {QUARTER_ORDER.map((q) => (
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

            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="outline" onClick={onClose}>Cancel</Button>
            <Button appearance="primary" onClick={handleSubmit}>Add Workstream</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
