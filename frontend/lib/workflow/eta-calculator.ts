/**
 * ETA Calculator for Workflow Target Dates
 * Calculates target dates based on ETA and business days (Sunday-Thursday in Oman)
 */

import { addDays, differenceInDays, isSameDay, isAfter, isBefore } from 'date-fns'

export type DemurrageRisk = 'none' | 'low' | 'medium' | 'high' | 'critical'

export class ETACalculator {
  private readonly OMAN_TIMEZONE = 'Asia/Muscat'
  private readonly WORKING_DAYS = [0, 1, 2, 3, 4] // Sunday-Thursday
  private holidays: Date[] = []

  constructor(holidays: Date[] = []) {
    this.holidays = holidays
  }

  /**
   * Calculate target date for a workflow step based on ETA and offset
   * @param eta - Estimated Time of Arrival
   * @param etaOffset - Days from ETA (negative = before, positive = after)
   * @returns Target date for the step
   */
  calculateTargetDate(eta: Date, etaOffset: number): Date {
    if (etaOffset === 0) {
      return eta
    }

    const direction = etaOffset > 0 ? 1 : -1
    const daysToAdd = Math.abs(etaOffset)
    let currentDate = new Date(eta)
    let businessDaysAdded = 0

    while (businessDaysAdded < daysToAdd) {
      currentDate = addDays(currentDate, direction)

      if (this.isBusinessDay(currentDate)) {
        businessDaysAdded++
      }
    }

    return currentDate
  }

  /**
   * Check if a date is a business day (Sunday-Thursday, excluding holidays)
   */
  private isBusinessDay(date: Date): boolean {
    const dayOfWeek = date.getDay()
    const isWorkingDay = this.WORKING_DAYS.includes(dayOfWeek)
    const isHoliday = this.holidays.some((holiday) => isSameDay(holiday, date))

    return isWorkingDay && !isHoliday
  }

  /**
   * Calculate all target dates for a shipment
   */
  calculateAllTargetDates(eta: Date, stepOffsets: number[]): Map<number, Date> {
    const targetDates = new Map<number, Date>()

    stepOffsets.forEach((offset, index) => {
      const stepNumber = index + 1
      const targetDate = this.calculateTargetDate(eta, offset)
      targetDates.set(stepNumber, targetDate)
    })

    return targetDates
  }

  /**
   * Recalculate target dates when ETA changes
   */
  recalculateOnETAChange(
    currentETA: Date,
    newETA: Date,
    stepOffsets: number[],
    completedSteps: number[]
  ): ETAChangeResult {
    const oldTargetDates = this.calculateAllTargetDates(currentETA, stepOffsets)
    const newTargetDates = this.calculateAllTargetDates(newETA, stepOffsets)
    const affectedSteps: number[] = []

    // Only pending steps are affected
    stepOffsets.forEach((_, index) => {
      const stepNumber = index + 1
      if (!completedSteps.includes(stepNumber)) {
        const oldDate = oldTargetDates.get(stepNumber)!
        const newDate = newTargetDates.get(stepNumber)!

        if (!isSameDay(oldDate, newDate)) {
          affectedSteps.push(stepNumber)
        }
      }
    })

    return {
      oldETA: currentETA,
      newETA,
      affectedSteps,
      oldTargetDates,
      newTargetDates,
    }
  }

  /**
   * Calculate days at risk (days overdue or approaching deadline)
   */
  calculateDaysAtRisk(targetDate: Date, actualDate?: Date): number {
    const referenceDate = actualDate || new Date()
    const daysDiff = differenceInDays(referenceDate, targetDate)

    return daysDiff > 0 ? daysDiff : 0
  }

  /**
   * Calculate demurrage risk level
   * Demurrage starts 8 days after ETA
   */
  calculateDemurrageRisk(eta: Date, goodsCollectedDate?: Date): DemurrageRisk {
    const demurrageStartDate = addDays(eta, 8)
    const today = new Date()

    if (goodsCollectedDate) {
      const daysToCollection = differenceInDays(goodsCollectedDate, eta)
      return daysToCollection >= 8 ? 'critical' : 'none'
    }

    const daysUntilDemurrage = differenceInDays(demurrageStartDate, today)

    if (daysUntilDemurrage < 0) return 'critical'
    if (daysUntilDemurrage === 0) return 'high'
    if (daysUntilDemurrage === 1) return 'medium'
    if (daysUntilDemurrage <= 2) return 'low'
    return 'none'
  }

  /**
   * Calculate predictive completion date based on velocity
   */
  calculatePredictiveCompletion(
    eta: Date,
    totalSteps: number,
    completedSteps: Array<{ stepNumber: number; targetDate: Date; actualDate: Date }>
  ): Date {
    if (completedSteps.length < 3) {
      // Not enough data, use standard timeline (ETA+9)
      return this.calculateTargetDate(eta, 9)
    }

    // Calculate average days per step
    const totalDays = completedSteps.reduce((sum, step) => {
      const daysTaken = differenceInDays(step.actualDate, step.targetDate)
      return sum + daysTaken
    }, 0)

    const avgDaysPerStep = totalDays / completedSteps.length
    const remainingSteps = totalSteps - completedSteps.length
    const projectedDays = remainingSteps * avgDaysPerStep

    const lastCompletedDate = completedSteps[completedSteps.length - 1].actualDate
    return addDays(lastCompletedDate, Math.ceil(projectedDays))
  }

  /**
   * Calculate business days between two dates
   */
  calculateBusinessDaysBetween(startDate: Date, endDate: Date): number {
    let count = 0
    let currentDate = new Date(startDate)

    while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
      if (this.isBusinessDay(currentDate)) {
        count++
      }
      currentDate = addDays(currentDate, 1)
    }

    return count
  }

  /**
   * Check if a date is overdue
   */
  isOverdue(targetDate: Date, actualDate?: Date): boolean {
    const referenceDate = actualDate || new Date()
    return isAfter(referenceDate, targetDate)
  }

  /**
   * Check if a date is due soon (within 1 business day)
   */
  isDueSoon(targetDate: Date): boolean {
    const today = new Date()
    const businessDaysUntilDue = this.calculateBusinessDaysBetween(today, targetDate)
    return businessDaysUntilDue <= 1 && businessDaysUntilDue >= 0
  }

  /**
   * Get status based on target date
   */
  getStepStatus(
    targetDate: Date,
    actualDate?: Date,
    isBlocked: boolean = false
  ): 'completed' | 'overdue' | 'at_risk' | 'in_progress' | 'pending' | 'blocked' {
    if (isBlocked) return 'blocked'
    if (actualDate) return 'completed'
    if (this.isOverdue(targetDate)) return 'overdue'
    if (this.isDueSoon(targetDate)) return 'at_risk'

    const today = new Date()
    const daysUntilDue = differenceInDays(targetDate, today)

    if (daysUntilDue <= 3) return 'in_progress'
    return 'pending'
  }
}

export interface ETAChangeResult {
  oldETA: Date
  newETA: Date
  affectedSteps: number[]
  oldTargetDates: Map<number, Date>
  newTargetDates: Map<number, Date>
}

// Export singleton instance
export const etaCalculator = new ETACalculator()
