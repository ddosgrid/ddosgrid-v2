import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import HelloWorld from '@/components/BarChart.vue'

describe('BarChart.vue', () => {
  it('Accepts a dataset as a property', () => {
    const dataset = [{ port: 80, count: 100 }]
    const wrapper = mount(HelloWorld, {
      propsData: { dataset }
    })
    expect(wrapper.props().dataset).to.include(dataset[0])
  })
})
