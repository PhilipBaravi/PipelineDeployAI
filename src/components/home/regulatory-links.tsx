const RegulatoryLinks = () => {
  const mock_links_data = [
    {
      id: 1,
      title: "New Roads and Street Works Act 1991",
      link: "www.legislation.gov.uk/ukpga/1991/22/contents",
    },
    {
      id: 2,
      title: "Highways Act 1980",
      link: "www.legislation.gov.uk/ukpga/1980/66/contents",
    },
    {
      id: 3,
      title: "Building Regulations Approval:",
      link: "www.gov.uk/government/collections/approved-documents",
    },
  ];
  return (
    <div className="flex flex-col gap-y-2 pt-4">
      <h1 className="text-md font-bold">Regulatory Links</h1>
      {mock_links_data.map((el) => {
        return (
          <div key={el.id} className="flex gap-x-2 text-sm">
            <p className="text-sm"> {el.title}:</p>{" "}
            <a href={el.link} className="text-sm underline text-blue-700">
              {el.link}
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default RegulatoryLinks;
