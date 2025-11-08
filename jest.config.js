export default {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.[tj]sx?$": "babel-jest",
    },
    moduleNameMapper: {
        "^.+\\.svg\\?react$": "<rootDir>/__mocks__/svgMock.js",
        "\\.(css|less|scss)$": "identity-obj-proxy",
        "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
    },
    setupFilesAfterEnv: ["@testing-library/jest-dom"],
    testPathIgnorePatterns: ["/node_modules/", "/tests/playwright/"],
};
