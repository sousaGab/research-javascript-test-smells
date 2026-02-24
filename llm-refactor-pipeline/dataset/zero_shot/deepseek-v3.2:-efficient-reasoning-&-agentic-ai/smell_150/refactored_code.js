const verifyLiClasses = (wrapper, expectedConditions) => {
   const lis = wrapper.findAll('li').wrappers
   expect(lis.length).toBe(expectedConditions.length)
   lis.forEach((li, index) => {
     const conditions = expectedConditions[index]
     if (conditions.contains) {
       conditions.contains.forEach(className => {
         expect(li.classes()).toContain(className)
       })
     }
     if (conditions.notContains) {
       conditions.notContains.forEach(className => {
         expect(li.classes()).not.toContain(className)
       })
     }
   })
 }