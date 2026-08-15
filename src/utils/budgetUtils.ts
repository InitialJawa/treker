import { Trip, Expense, ItineraryItem, Booking, TransportLeg, ExpenseCategory } from '../types/travel';

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalEstimated: number;
  remainingBudget: number;
  spentPercentage: number;
  categoryTotals: Array<{
    category: ExpenseCategory;
    estimated: number;
    actual: number;
  }>;
}

export function calculateTripBudgetSummary(
  trip: Trip,
  expenses: Expense[] = [],
  itineraryItems: ItineraryItem[] = [],
  bookings: Booking[] = [],
  transports: TransportLeg[] = []
): BudgetSummary {
  const totalBudget = trip.budget || 0;

  // Manual paid expenses from Budget tab
  const paidExpensesSum = expenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + (e.actualAmount || 0), 0);

  // Manual estimated expenses from Budget tab
  const estimatedExpensesSum = expenses
    .reduce((sum, e) => sum + (e.estimatedAmount || 0), 0);

  // Itinerary items cost
  const itineraryCostSum = itineraryItems
    .reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

  // Bookings cost
  const bookingsCostSum = bookings
    .reduce((sum, b) => sum + (b.price || 0), 0);

  // Transports cost
  const transportsCostSum = transports
    .reduce((sum, t) => sum + (t.estimatedCost || 0), 0);

  // Total Estimated (All sources)
  const totalEstimated = estimatedExpensesSum + itineraryCostSum + bookingsCostSum + transportsCostSum;

  // Total Actual Spent (Combined paid expenses + itinerary + bookings + transports)
  const totalSpent = paidExpensesSum + itineraryCostSum + bookingsCostSum + transportsCostSum;

  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const spentPercentage = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  // Category breakdown
  const categories: ExpenseCategory[] = [
    'Transportation', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Tickets', 'Rental', 'Emergency', 'Other'
  ];

  const categoryTotals = categories.map(cat => {
    const catExp = expenses.filter(e => e.category === cat);
    let est = catExp.reduce((s, e) => s + (e.estimatedAmount || 0), 0);
    let act = catExp.filter(e => e.status === 'paid').reduce((s, e) => s + (e.actualAmount || 0), 0);

    // Add itinerary costs by category
    itineraryItems.forEach(item => {
      if (
        (cat === 'Activities' && item.category === 'Activity') ||
        (cat === 'Food' && item.category === 'Food') ||
        (cat === 'Transportation' && item.category === 'Transport') ||
        (cat === 'Accommodation' && item.category === 'Hotel') ||
        (cat === 'Shopping' && item.category === 'Shopping') ||
        (cat === 'Other' && (item.category === 'Free time' || item.category === 'Other'))
      ) {
        est += item.estimatedCost || 0;
        act += item.estimatedCost || 0;
      }
    });

    // Add bookings costs by category
    bookings.forEach(b => {
      const bType = (b.type || '').toLowerCase();
      if (
        (cat === 'Accommodation' && bType.includes('hotel')) ||
        (cat === 'Transportation' && (bType.includes('flight') || bType.includes('train') || bType.includes('bus') || bType.includes('ferry'))) ||
        (cat === 'Rental' && (bType.includes('car') || bType.includes('motor') || bType.includes('rental'))) ||
        (cat === 'Tickets' && bType.includes('attraction'))
      ) {
        est += b.price || 0;
        act += b.price || 0;
      }
    });

    // Add transport legs by category
    transports.forEach(t => {
      if (cat === 'Transportation') {
        est += t.estimatedCost || 0;
        act += t.estimatedCost || 0;
      }
    });

    return { category: cat, estimated: est, actual: act };
  }).filter(c => c.estimated > 0 || c.actual > 0);

  return {
    totalBudget,
    totalSpent,
    totalEstimated,
    remainingBudget,
    spentPercentage,
    categoryTotals,
  };
}
