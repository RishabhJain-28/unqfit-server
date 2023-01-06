export const verifyEmailTemplate = {
  email: (verifyLink: string) => `
<div>
<h5>Welcome to Unqfit !!!</h5>
<h4>Click <a href=${verifyLink}>here</a> below to verify your email : </h4>

</div>
`,
  subject: () => 'Unqfit verication code',
};

//!change
