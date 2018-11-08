'use strict'

import { nearlyEqual as bigNearlyEqual } from '../../utils/bignumber/nearlyEqual'
import { nearlyEqual } from '../../utils/number'
import { factory } from '../../utils/factory'
import { latexOperators } from '../../utils/latex'
import { createAlgorithm03 } from '../../type/matrix/utils/algorithm03'
import { createAlgorithm07 } from '../../type/matrix/utils/algorithm07'
import { createAlgorithm12 } from '../../type/matrix/utils/algorithm12'
import { createAlgorithm14 } from '../../type/matrix/utils/algorithm14'
import { createAlgorithm13 } from '../../type/matrix/utils/algorithm13'

const name = 'larger'
const dependencies = [
  'typed',
  'config',
  'matrix',
  'type.DenseMatrix'
]

export const createLarger = factory(name, dependencies, ({ typed, config, matrix, type: { DenseMatrix } }) => {
  const algorithm03 = createAlgorithm03({ typed })
  const algorithm07 = createAlgorithm07({ typed, type: { DenseMatrix } })
  const algorithm12 = createAlgorithm12({ typed, type: { DenseMatrix } })
  const algorithm13 = createAlgorithm13({ typed })
  const algorithm14 = createAlgorithm14({ typed })

  /**
   * Test whether value x is larger than y.
   *
   * The function returns true when x is larger than y and the relative
   * difference between x and y is larger than the configured epsilon. The
   * function cannot be used to compare values smaller than approximately 2.22e-16.
   *
   * For matrices, the function is evaluated element wise.
   * Strings are compared by their numerical value.
   *
   * Syntax:
   *
   *    math.larger(x, y)
   *
   * Examples:
   *
   *    math.larger(2, 3)             // returns false
   *    math.larger(5, 2 + 2)         // returns true
   *
   *    const a = math.unit('5 cm')
   *    const b = math.unit('2 inch')
   *    math.larger(a, b)             // returns false
   *
   * See also:
   *
   *    equal, unequal, smaller, smallerEq, largerEq, compare
   *
   * @param  {number | BigNumber | Fraction | boolean | Unit | string | Array | Matrix} x First value to compare
   * @param  {number | BigNumber | Fraction | boolean | Unit | string | Array | Matrix} y Second value to compare
   * @return {boolean | Array | Matrix} Returns true when the x is larger than y, else returns false
   */
  const larger = typed(name, {

    'boolean, boolean': function (x, y) {
      return x > y
    },

    'number, number': function (x, y) {
      return x > y && !nearlyEqual(x, y, config().epsilon)
    },

    'BigNumber, BigNumber': function (x, y) {
      return x.gt(y) && !bigNearlyEqual(x, y, config().epsilon)
    },

    'Fraction, Fraction': function (x, y) {
      return x.compare(y) === 1
    },

    'Complex, Complex': function () {
      throw new TypeError('No ordering relation is defined for complex numbers')
    },

    'Unit, Unit': function (x, y) {
      if (!x.equalBase(y)) {
        throw new Error('Cannot compare units with different base')
      }
      return larger(x.value, y.value)
    },

    'SparseMatrix, SparseMatrix': function (x, y) {
      return algorithm07(x, y, larger)
    },

    'SparseMatrix, DenseMatrix': function (x, y) {
      return algorithm03(y, x, larger, true)
    },

    'DenseMatrix, SparseMatrix': function (x, y) {
      return algorithm03(x, y, larger, false)
    },

    'DenseMatrix, DenseMatrix': function (x, y) {
      return algorithm13(x, y, larger)
    },

    'Array, Array': function (x, y) {
      // use matrix implementation
      return larger(matrix(x), matrix(y)).valueOf()
    },

    'Array, Matrix': function (x, y) {
      // use matrix implementation
      return larger(matrix(x), y)
    },

    'Matrix, Array': function (x, y) {
      // use matrix implementation
      return larger(x, matrix(y))
    },

    'SparseMatrix, any': function (x, y) {
      return algorithm12(x, y, larger, false)
    },

    'DenseMatrix, any': function (x, y) {
      return algorithm14(x, y, larger, false)
    },

    'any, SparseMatrix': function (x, y) {
      return algorithm12(y, x, larger, true)
    },

    'any, DenseMatrix': function (x, y) {
      return algorithm14(y, x, larger, true)
    },

    'Array, any': function (x, y) {
      // use matrix implementation
      return algorithm14(matrix(x), y, larger, false).valueOf()
    },

    'any, Array': function (x, y) {
      // use matrix implementation
      return algorithm14(matrix(y), x, larger, true).valueOf()
    }
  })

  larger.toTex = {
    2: `\\left(\${args[0]}${latexOperators['larger']}\${args[1]}\\right)`
  }

  return larger
})
