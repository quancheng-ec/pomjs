/**
 * Created by joe on 2016/10/23.
 */


const services = {
    projectService: 'com.quancheng.hemera.service.ProjectService:1.0.0',
    requirementService: 'com.quancheng.hemera.service.RequirementService:dev:1.0.0',
    resourceService: 'com.quancheng.hemera.service.ResourceService'
}

module.exports = {
    salukiGroup: 'dev',
    salukiRegister: 'daily.quancheng-ec.com',
    salukiPort: 8500,
    services: services
}