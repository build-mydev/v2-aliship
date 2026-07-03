export const PARCEL_STATUSES = {
  // Forward Flow
  PENDING_CONFIRMATION: "Pending Confirmation",
  REJECTED: "Rejected",
  ARRIVED_AT_ORIGIN_OFFICE: "Arrived at Origin Office",
  DEPARTED_TO_DC: "Departed to DC",
  ARRIVED_AT_DC: "Arrived at DC",
  SORTED_AT_DC: "Sorted at DC",
  DEPARTED_TO_DESTINATION_DC: "Departed to Destination DC",
  ARRIVED_AT_DESTINATION_DC: "Arrived at Destination DC",
  SORTED_AT_DESTINATION_DC: "Sorted at Destination DC",
  DEPARTED_TO_SITE_OFFICE: "Departed to Site Office",
  ARRIVED_AT_SITE_OFFICE: "Arrived at Site Office",
  OUT_FOR_DELIVERY: "Out for Delivery",
  READY_FOR_COLLECTION: "Ready for Collection",
  DELIVERED: "Delivered",
  COLLECTED: "Collected",
  // Exceptions
  DAMAGED_AT_INTAKE: "Damaged at Intake",
  UNDER_INVESTIGATION: "Under Investigation",
  LOST: "Lost",
  ON_HOLD_ADDRESS: "On Hold - Address Issue",
  ON_HOLD_RESCHEDULED: "On Hold - Rescheduled",
  DELIVERY_ATTEMPTED: "Delivery Attempted",
  DELIVERY_FAILED: "Delivery Failed - Pending Decision",
  // Return Flow
  RETURN_INITIATED: "Return Initiated",
  RETURN_IN_TRANSIT: "Return in Transit",
  RETURN_ARRIVED_ORIGIN_DC: "Return Arrived at Origin DC",
  RETURN_ARRIVED_ORIGIN_OFFICE: "Return Arrived at Origin Office",
  RETURN_DELIVERED: "Return Delivered",
} as const;

export type ParcelStatus = typeof PARCEL_STATUSES[keyof typeof PARCEL_STATUSES];

export const TERMINAL_STATUSES: ParcelStatus[] = [
  "Delivered",
  "Collected",
  "Return Delivered",
  "Rejected",
  "Lost",
];

export const EXCEPTION_STATUSES: ParcelStatus[] = [
  "Damaged at Intake",
  "Under Investigation",
  "Lost",
  "On Hold - Address Issue",
  "On Hold - Rescheduled",
  "Delivery Attempted",
  "Delivery Failed - Pending Decision",
];

export const RETURN_STATUSES: ParcelStatus[] = [
  "Return Initiated",
  "Return in Transit",
  "Return Arrived at Origin DC",
  "Return Arrived at Origin Office",
  "Return Delivered",
];

export const ACTIVE_STATUSES: ParcelStatus[] = [
  "Pending Confirmation",
  "Arrived at Origin Office",
  "Departed to DC",
  "Arrived at DC",
  "Sorted at DC",
  "Departed to Destination DC",
  "Arrived at Destination DC",
  "Sorted at Destination DC",
  "Departed to Site Office",
  "Arrived at Site Office",
  "Out for Delivery",
  "Ready for Collection",
];

export const ALLOWED_TRANSITIONS: Record<ParcelStatus, ParcelStatus[]> = {
  "Pending Confirmation": ["Arrived at Origin Office", "Rejected", "Damaged at Intake"],
  "Arrived at Origin Office": ["Departed to DC", "Damaged at Intake"],
  "Departed to DC": ["Arrived at DC", "Under Investigation"],
  "Arrived at DC": ["Sorted at DC", "Under Investigation", "Damaged at Intake"],
  "Sorted at DC": ["Departed to Destination DC", "Departed to Site Office"],
  "Departed to Destination DC": ["Arrived at Destination DC", "Under Investigation"],
  "Arrived at Destination DC": ["Sorted at Destination DC", "Under Investigation", "Damaged at Intake"],
  "Sorted at Destination DC": ["Departed to Site Office"],
  "Departed to Site Office": ["Arrived at Site Office", "Under Investigation"],
  "Arrived at Site Office": ["Out for Delivery", "Ready for Collection"],
  "Out for Delivery": [
    "Delivered",
    "Delivery Attempted",
    "On Hold - Address Issue",
    "On Hold - Rescheduled",
    "Return Initiated",
  ],
  "Ready for Collection": ["Collected", "Return Initiated"],
  "Delivery Attempted": [
    "Out for Delivery",
    "On Hold - Rescheduled",
    "On Hold - Address Issue",
    "Ready for Collection",
    "Return Initiated",
    "Delivery Failed - Pending Decision",
  ],
  "On Hold - Rescheduled": ["Out for Delivery", "Return Initiated"],
  "On Hold - Address Issue": ["Out for Delivery", "Return Initiated"],
  "Delivery Failed - Pending Decision": [
    "Out for Delivery",
    "Ready for Collection",
    "Return Initiated",
  ],
  "Under Investigation": [
    "Arrived at DC",
    "Arrived at Destination DC",
    "Arrived at Site Office",
    "Lost",
  ],
  "Damaged at Intake": ["Arrived at Origin Office", "Under Investigation", "Return Initiated"],
  "Return Initiated": ["Return in Transit"],
  "Return in Transit": ["Return Arrived at Origin DC"],
  "Return Arrived at Origin DC": ["Return Arrived at Origin Office"],
  "Return Arrived at Origin Office": ["Return Delivered"],
  Rejected: [],
  Delivered: [],
  Collected: [],
  Lost: [],
  "Return Delivered": [],
};

export function statusBadgeClass(status: ParcelStatus): string {
  if (TERMINAL_STATUSES.includes(status)) {
    if (status === "Delivered" || status === "Collected" || status === "Return Delivered") {
      return "bg-green-100 text-green-800";
    }
    if (status === "Rejected" || status === "Lost") {
      return "bg-red-100 text-red-800";
    }
  }
  if (EXCEPTION_STATUSES.includes(status)) {
    if (status === "Delivery Attempted" || status === "Delivery Failed - Pending Decision") {
      return "bg-orange-100 text-orange-800";
    }
    if (status === "On Hold - Rescheduled" || status === "On Hold - Address Issue") {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-red-100 text-red-800";
  }
  if (RETURN_STATUSES.includes(status)) {
    return "bg-purple-100 text-purple-800";
  }
  const blueStatuses: ParcelStatus[] = [
    "Arrived at Origin Office",
    "Arrived at DC",
    "Arrived at Destination DC",
    "Arrived at Site Office",
  ];
  if (blueStatuses.includes(status)) return "bg-blue-100 text-blue-800";

  const orangeStatuses: ParcelStatus[] = [
    "Departed to DC",
    "Departed to Destination DC",
    "Departed to Site Office",
  ];
  if (orangeStatuses.includes(status)) return "bg-orange-100 text-orange-800";

  const purpleStatuses: ParcelStatus[] = ["Sorted at DC", "Sorted at Destination DC"];
  if (purpleStatuses.includes(status)) return "bg-purple-100 text-purple-800";

  if (status === "Out for Delivery") return "bg-indigo-100 text-indigo-800";
  if (status === "Ready for Collection") return "bg-teal-100 text-teal-800";
  if (status === "Pending Confirmation") return "bg-yellow-100 text-yellow-800";

  return "bg-gray-100 text-gray-800";
}

export const SCAN_CONFIG: Record<
  string,
  {
    title: string;
    fromStatus: ParcelStatus[];
    toStatus: ParcelStatus;
    requiresPhoto: boolean;
    requiresSignature: boolean;
    requiresRider: boolean;
    requiresRackNumber: boolean;
    requiresWeight: boolean;
    smsTriggered: boolean;
  }
> = {
  pickup: {
    title: "Pick-up Scan",
    fromStatus: ["Pending Confirmation"],
    toStatus: "Arrived at Origin Office",
    requiresPhoto: false,
    requiresSignature: false,
    requiresRider: false,
    requiresRackNumber: false,
    requiresWeight: true,
    smsTriggered: false,
  },
  departure: {
    title: "Departure Scan",
    fromStatus: ["Arrived at Origin Office", "Sorted at DC", "Sorted at Destination DC"],
    toStatus: "Departed to DC",
    requiresPhoto: false,
    requiresSignature: false,
    requiresRider: false,
    requiresRackNumber: false,
    requiresWeight: false,
    smsTriggered: false,
  },
  arrival: {
    title: "Arrival Scan",
    fromStatus: ["Departed to DC", "Departed to Destination DC", "Departed to Site Office"],
    toStatus: "Arrived at DC",
    requiresPhoto: false,
    requiresSignature: false,
    requiresRider: false,
    requiresRackNumber: false,
    requiresWeight: true,
    smsTriggered: false,
  },
  collection: {
    title: "Ready for Collection Scan",
    fromStatus: ["Arrived at Site Office"],
    toStatus: "Ready for Collection",
    requiresPhoto: false,
    requiresSignature: false,
    requiresRider: false,
    requiresRackNumber: true,
    requiresWeight: false,
    smsTriggered: true,
  },
  out_delivery: {
    title: "Out of Delivery Scan",
    fromStatus: ["Arrived at Site Office"],
    toStatus: "Out for Delivery",
    requiresPhoto: false,
    requiresSignature: false,
    requiresRider: true,
    requiresRackNumber: false,
    requiresWeight: false,
    smsTriggered: true,
  },
  delivered: {
    title: "Delivered Scan",
    fromStatus: ["Out for Delivery"],
    toStatus: "Delivered",
    requiresPhoto: true,
    requiresSignature: true,
    requiresRider: false,
    requiresRackNumber: false,
    requiresWeight: false,
    smsTriggered: false,
  },
  return_delivered: {
    title: "Return Delivered Scan",
    fromStatus: ["Return Arrived at Origin Office"],
    toStatus: "Return Delivered",
    requiresPhoto: false,
    requiresSignature: false,
    requiresRider: false,
    requiresRackNumber: false,
    requiresWeight: false,
    smsTriggered: false,
  },
  hold: {
    title: "Hold Scan",
    fromStatus: ["Out for Delivery", "Delivery Attempted"],
    toStatus: "On Hold - Rescheduled",
    requiresPhoto: false,
    requiresSignature: false,
    requiresRider: false,
    requiresRackNumber: false,
    requiresWeight: false,
    smsTriggered: false,
  },
  exception: {
    title: "Exception Entry",
    fromStatus: [
      "Arrived at DC",
      "Arrived at Destination DC",
      "Arrived at Site Office",
      "Departed to DC",
      "Departed to Destination DC",
    ],
    toStatus: "Under Investigation",
    requiresPhoto: true,
    requiresSignature: false,
    requiresRider: false,
    requiresRackNumber: false,
    requiresWeight: false,
    smsTriggered: false,
  },
  return_entry: {
    title: "Return Entry",
    fromStatus: [
      "Delivery Failed - Pending Decision",
      "Ready for Collection",
      "Out for Delivery",
    ],
    toStatus: "Return Initiated",
    requiresPhoto: false,
    requiresSignature: false,
    requiresRider: false,
    requiresRackNumber: false,
    requiresWeight: false,
    smsTriggered: true,
  },
};
