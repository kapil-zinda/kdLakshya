import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons';

export const labels = [
  {
    value: 'watch',
    label: 'Watch',
  },
  {
    value: 'analyze',
    label: 'Analyze',
  },
  {
    value: 'read',
    label: 'Read',
  },
  {
    value: 'learn',
    label: 'Learn',
  },
  {
    value: 'talk',
    label: 'Talk',
  },
  {
    value: 'walk',
    label: 'Walk',
  },
];

export const statuses = [
  {
    value: 'backlog',
    label: 'Backlog',
    icon: QuestionMarkCircledIcon,
  },
  {
    value: 'todo',
    label: 'Todo',
    icon: CircleIcon,
  },
  {
    value: 'in progress',
    label: 'In Progress',
    icon: StopwatchIcon,
  },
  {
    value: 'done',
    label: 'Done',
    icon: CheckCircledIcon,
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: CrossCircledIcon,
  },
];

export const priorities = [
  {
    label: 'Important',
    value: 'important',
    icon: ArrowUpIcon,
  },
  {
    label: 'Not Important',
    value: 'not-important',
    icon: ArrowDownIcon,
  },
];

export const categories = [
  {
    label: 'Urgent',
    value: 'urgent',
    icon: ArrowLeftIcon,
  },
  {
    label: 'Not Urgent',
    value: 'not-urgent',
    icon: ArrowRightIcon,
  },
];
