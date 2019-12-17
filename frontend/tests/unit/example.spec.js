import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/BarChart.vue'

describe('BarChart.vue', () => {
  global.fetch = async () => {
    return {
      json: async () => {
        return {
          topTen: [
            {
              count: 1,
              port: 1
            }
          ]
        }
      }
    }
  }
  it('Accepts a dataset as a property', () => {
    const wrapper = shallowMount(HelloWorld, {
      propsData: { url: '123' }
    })
    expect(wrapper.props().url).to.equal('123')
  })
})
