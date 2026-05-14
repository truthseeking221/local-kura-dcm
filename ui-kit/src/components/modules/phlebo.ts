// Hand-curated module view of @kura/ui-kit. See CLAUDE.md "Module tagging".
// Components tagged @kuraModules phlebo (or phlebo + others).
// Layer barrels remain canonical; this is an opinionated view for the
// phlebo app.
export { LockableField } from '../atoms/lockable-field.tsx'
export {
  BookingCalendar,
  type BookingCalendarProps,
} from '../molecules/booking-calendar.tsx'
export {
  ClinicalNumberField,
  type ClinicalNumberFieldProps,
  type ClinicalNumberFieldState,
} from '../molecules/clinical-number-field.tsx'
export {
  CompositeNumberField,
  type CompositeNumberFieldField,
  type CompositeNumberFieldProps,
} from '../molecules/composite-number-field.tsx'
export {
  ContextPickerPopover,
  type ContextPickerItem,
} from '../molecules/context-picker-popover.tsx'
export {
  DerivedValueField,
  type DerivedValueFieldProps,
} from '../molecules/derived-value-field.tsx'
export {
  JourneyList,
  type JourneyListProps,
  type JourneyListStatus,
  type JourneyListStep,
} from '../molecules/journey-list.tsx'
export {
  SampleStatusBadge,
  type SampleCollectionStatus,
  type SampleStatusBadgeProps,
} from '../molecules/sample-status-badge.tsx'
export {
  SearchTrigger,
  type SearchTriggerProps,
} from '../molecules/search-trigger.tsx'
export {
  SectionCard,
  type SectionCardMetaTone,
  type SectionCardPadding,
  type SectionCardProps,
  type SectionCardTone,
} from '../molecules/section-card.tsx'
export {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlProps,
} from '../molecules/segmented-control.tsx'
export {
  TubeDot,
  TubeVisual,
  type TubeDotProps,
  type TubeVisualProps,
  type TubeVisualSpec,
  type TubeVisualStatus,
  type TubeVisualTone,
} from '../molecules/tube-visual.tsx'
export {
  QueuePickList,
  type QueuePickListItem,
  type QueuePickListProps,
} from '../organisms/queue-pick-list.tsx'
export {
  SampleDeferDialog,
  type SampleDeferDialogProps,
  type SampleDeferDialogSample,
} from '../organisms/sample-defer-dialog.tsx'
export {
  SampleDetailPanel,
  type SampleDetailPanelProps,
  type SampleDetailPanelSample,
} from '../organisms/sample-detail-panel.tsx'
export {
  SampleTable,
  type SampleTableProps,
  type SampleTableSample,
} from '../organisms/sample-table.tsx'
export { ScanGatePanel, type ScanGatePanelProps } from '../organisms/scan-gate-panel.tsx'
export {
  SubjectContextCard,
  type SubjectContextCardProps,
  type SubjectContextDetail,
} from '../organisms/subject-context-card.tsx'
export { SubjectHeader } from '../organisms/subject-header.tsx'
export { TubeRack, type TubeRackItem, type TubeRackProps } from '../organisms/tube-rack.tsx'
export {
  WizardLayout,
  type WizardLayoutProps,
} from '../organisms/wizard-layout.tsx'
export {
  WizardStepFooter,
  type WizardStepFooterProps,
} from '../organisms/wizard-step-footer.tsx'
